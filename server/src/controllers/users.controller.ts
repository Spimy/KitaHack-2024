import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { Job } from '../../../shared/src/types/job';
import {
  UserGender,
  UserProfile,
  UserRole
} from '../../../shared/src/types/user';
import { jobsRef, profilesRef } from '../database';
import { auth } from '../firebase';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getJobWithUsers } from '../utils/job.util';
import { getMissingParameters } from '../utils/param.util';
import { formatSkills } from '../utils/skills.util';
import { getProfileById, hasProfile } from '../utils/user.util';

export const getProfile = async (request: Request, response: Response) => {
  const user = request.user;

  if (!hasProfile(user.profile)) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'User has no profile.'
    });
  }

  return response.status(StatusCodes.OK).json({ profile: user.profile });
};

export const getUsers = async (request: Request, response: Response) => {
  const token = request.params.token;

  auth.listUsers(10, token).then(async (list) => {
    const users = await Promise.all(
      list.users.map(async (user) => {
        return { ...user, profile: await getProfileById(user.uid) };
      })
    );

    return response.status(StatusCodes.OK).json({
      users,
      nextPageToken: list.pageToken || undefined
    });
  });
};

export const getUserById = async (request: Request, response: Response) => {
  const userId = request.params.id ?? '';

  await auth
    .getUser(userId)
    .then(async (user) => {
      return response.status(StatusCodes.OK).json({
        ...user,
        profile: await getProfileById(user.uid)
      });
    })
    .catch(() => {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: 'User you are looking for cannot be found.'
      });
    });
};

export const editOrCreateProfile = async (
  request: Request,
  response: Response
) => {
  const user = request.user;

  upload.single('avatar')(request, response, async (err) => {
    type ProfileParam = Record<
      keyof Omit<UserProfile, 'profilePictureUrl' | 'offers'>,
      string
    >;
    type Parameter = keyof ProfileParam;

    const params = getMissingParameters<Parameter>(request, [
      'firstName',
      'role',
      'dateOfBirth'
    ]);

    if (params.length > 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing parameters.',
        missing: params
      });
    }

    const body = request.body as ProfileParam;

    if (!Object.values(UserRole).includes(body.role as UserRole)) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Unknown role provided. Role must be one of UserRole.'
      });
    }

    if (
      body.gender &&
      !Object.values(UserGender).includes(body.gender as UserGender)
    ) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Unknown gender provided. Gender must be one of UserGender.'
      });
    }

    const dateOfBirth = new Date(body.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message:
          'Unknown date of birth provided. Date must follow the format YYYY-MM-DD.'
      });
    }

    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    let profilePictureUrl = user.profile?.profilePictureUrl ?? '';
    if (request.file) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const avatar = request.file;
      const buffer = avatar.buffer;
      const originalName = avatar.originalname;

      try {
        profilePictureUrl = await saveImage(
          baseUrl,
          'avatars',
          buffer,
          originalName
        );
      } catch (error: any) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `Something went wrong processing the file: ${error.message}`
        });
      }
    }

    const profileData: UserProfile = {
      firstName: body.firstName,
      lastName: body.lastName ?? user.profile?.lastName ?? '',
      gender: (body.gender as UserGender) ?? user.profile?.gender ?? '',
      dateOfBirth: dateOfBirth ?? user.profile?.dateOfBirth,
      phoneNumber: body.phoneNumber ?? user.profile?.phoneNumber ?? '',
      impairments:
        (body.impairments as unknown as string[]) ??
        user.profile?.impairments ??
        [],
      skills:
        ((body.skills as unknown as string[]) || undefined)?.map((skill) =>
          skill.toLowerCase()
        ) ??
        user.profile?.skills ??
        [],
      offers: user.profile?.offers ?? [],
      city: body.city ?? user.profile?.city ?? '',
      state: body.state ?? user.profile?.state ?? '',
      bio: body.bio ?? user.profile?.bio ?? '',
      address: body.address ?? user.profile?.address ?? '',
      profilePictureUrl,
      role: user.profile?.role ?? (body.role as UserRole),
      premium: body.premium
        ? body.premium === 'true'
        : user.profile?.premium ?? false
    };

    profilesRef.doc(user.uid).set({
      ...profileData,
      dateOfBirth: firestore.Timestamp.fromDate(profileData.dateOfBirth)
    });

    return response.status(StatusCodes.CREATED).json({
      message: 'Profile updated successfully.',
      user: { ...user, profile: profileData }
    });
  });
};

export const addOffer = async (request: Request, response: Response) => {
  const userId = (request.params.id as string) ?? '';
  const offerId = request.body.offerId as string;

  if (!userId) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing offer ID'
    });
  }

  if (!offerId) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing offer ID'
    });
  }

  const profile = await profilesRef.doc(userId).get();
  if (!profile.exists) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'Profile from id does not exist.'
    });
  }

  const profileData = profile.data() as UserProfile;
  profile.ref.set({
    ...profileData,
    offers: Array.from(new Set([...profileData.offers, offerId]))
  });

  return response.status(StatusCodes.OK).json({
    message: 'Successfully gave user an offer.'
  });
};

export const getUserOffers = async (request: Request, response: Response) => {
  const user = request.user;
  const userId = request.params.id ?? '';

  if (user.profile.role !== UserRole.BUSINESS && user.uid !== userId) {
    return response.status(StatusCodes.FORBIDDEN).json({
      message: 'You do not have permission to access this endpoint.'
    });
  }

  const profile = await getProfileById(userId);
  if (!hasProfile(profile)) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'User has no profile.'
    });
  }

  const offers = await Promise.all(
    profile.offers.map(async (jobId) => {
      const job = (await jobsRef.doc(jobId).get()) as GenericDocument<Job>;

      if (
        user.profile.role === UserRole.BUSINESS &&
        job.data().businessId !== user.uid
      ) {
        return null;
      }

      const populatedJob = await getJobWithUsers(job);
      if (Object.keys(populatedJob).includes('message')) return null;

      return populatedJob;
    })
  );

  return response
    .status(StatusCodes.OK)
    .json(offers.filter((offer) => offer !== null));
};

export const getUserApplications = async (
  request: Request,
  response: Response
) => {
  const business = request.user;
  const userId = request.params.id ?? '';

  const jobs = await jobsRef.get();
  const jobDocs = jobs.docs as GenericDocument<Job>[];

  const applications = await Promise.all(
    jobDocs
      .filter(
        (job) =>
          job.data().businessId === business.uid &&
          job.data().applicants.includes(userId)
      )
      .map(async (job) => {
        const { skills, ...jobData } = job.data();
        return {
          id: job.id,
          ...jobData,
          skills: await formatSkills(skills)
        };
      })
  );

  return response.status(StatusCodes.OK).json(applications);
};

export const getOffersByBusiness = async (
  request: Request,
  response: Response
) => {
  return await auth.listUsers().then(async (results) => {
    const business = request.user;
    const offers: any[] = [];

    for (const user of results.users) {
      const profile = await getProfileById(user.uid);

      offers.push(
        ...(
          await Promise.all(
            profile.offers.map(async (jobId) => {
              const job = (await jobsRef
                .doc(jobId)
                .get()) as GenericDocument<Job>;

              const populatedJob = (await getJobWithUsers(job)) as any;
              if (Object.keys(populatedJob).includes('message')) return null;
              if (populatedJob.business.uid !== business.uid) return null;

              return populatedJob as any;
            })
          )
        ).filter((job) => job !== null)
      );
    }

    return response.status(StatusCodes.OK).json(offers);
  });
};
