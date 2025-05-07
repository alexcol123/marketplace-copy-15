import { SubmitButton } from "@/components/(custom)/(dashboard)/Form/Buttons";
import FormContainer from "@/components/(custom)/(dashboard)/Form/FormContainer";
import FormInput from "@/components/(custom)/(dashboard)/Form/FormInput";
import ImageInputContainer from "@/components/(custom)/(dashboard)/Form/ImageInputContainer";
import TextAreaInput from "@/components/(custom)/(dashboard)/Form/TextAreaInput";

import {
  fetchProfile,
  updateProfileAction,
  updateProfileImageAction,
  // updateProfileImageAction,
} from "@/utils/actions";

import { redirect } from "next/navigation";
type UserProfile = {
  profileImage: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string
  // other profile properties
};

const ProfilePage = async () => {
  const profile = (await fetchProfile()) as UserProfile;

  console.log(profile);

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">
        Update Your Profile
      </h1>
      <div className="border p-8 rounded-md">
        <ImageInputContainer
          image={profile.profileImage}
          name={profile.username}
          action={updateProfileImageAction}
          text={"Update Image"}
        />

        <FormContainer action={updateProfileAction}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <FormInput
              type="text"
              name="firstName"
              label="First Name"
              placeholder="John"
              defaultValue={profile.firstName}
            />

            <FormInput
              type="text"
              name="lastName"
              label="Last Name"
              placeholder="Smith"
              defaultValue={profile.lastName}
            />

            <FormInput
              type="text"
              name="username"
              label="Username"
              placeholder="john785"
              defaultValue={profile.username}
            />

            <TextAreaInput
              name="bio"
              labelText="bio (under 500 characters)"
              defaultValue={profile?.bio}
            />
          </div>

          <SubmitButton className="mt-10" text="update profile " />
        </FormContainer>
      </div>
    </section>
  );
};
export default ProfilePage;
