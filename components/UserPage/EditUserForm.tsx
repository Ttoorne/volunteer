import { useState } from "react";
import { userPage__translation } from "./Translation";
import { useLanguage } from "@/context/LanguageContext";

export interface ProfileSectionProps {
  section: string;
  profileData: {
    avatar: string | File | null;
    firstName: string;
    lastName: string;
    bio: string;
    phone: string;
    location: string;
    skills: string[];
    email: string;
  };
  onSave: (fields: { [key: string]: any }) => void;
  onCancel: () => void;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  location: string;
  skills: string[];
  avatar: string | File | null;
}

interface ContactInfo {
  phone: string;
  location: string;
}

const EditUserForm = ({
  section,
  profileData,
  onSave,
  onCancel,
  setAvatarFile,
}: ProfileSectionProps) => {
  const initialValues =
    section === "personalInfo"
      ? {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          skills: profileData.skills,
        }
      : {
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
        };

  const [values, setValues] = useState<PersonalInfo | ContactInfo>(
    initialValues
  );
  const [loading, setLoading] = useState(false);
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = userPage__translation[language];

  const handleChange = (
    field: string,
    newValue: string | string[] | File | null
  ) => {
    setValues((prevValues: any) => ({
      ...prevValues,
      [field]: newValue,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      handleChange("avatar", file);
    }
  };

  const getFields = () => {
    if (section === "personalInfo") {
      return (
        <div className="flex flex-col space-y-3">
          <div className="form-control">
            <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
              {t.avatar}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
              {t.firstName}
              <input
                type="text"
                className="grow bg-white w-32 max-w-sm text-black"
                placeholder=""
                value={(values as PersonalInfo).firstName ?? ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
              {t.lastName}
              <input
                type="text"
                className="grow bg-white w-32 max-w-sm text-black"
                placeholder=""
                value={(values as PersonalInfo).lastName ?? ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="form-control">
              <div className="label">
                <span className="label-text text-slate-500">{t.yourBio}</span>
              </div>
              <textarea
                className="textarea textarea-bordered h-24 bg-white"
                placeholder={t.writeSomethingAboutYourself}
                value={(values as PersonalInfo).bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                maxLength={150}
              ></textarea>
              <div className="text-sm text-gray-500 w-full mt-1 text-right">
                <span>
                  {((values as PersonalInfo).bio ?? "").length}
                  {t.characterLimit}
                </span>
              </div>
            </label>
          </div>
        </div>
      );
    }

    if (section === "contactInfo") {
      return (
        <div className="flex flex-col gap-2">
          <div className="form-control pb-1">
            <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
              {t.phone}
              <input
                type="number"
                className="grow bg-white w-32 max-w-sm text-black"
                placeholder=""
                value={(values as ContactInfo).phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </label>
          </div>
          <div className="form-control pb-1">
            <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
              {t.location}
              <input
                type="text"
                className="grow bg-white w-32 max-w-sm text-black"
                placeholder=""
                value={(values as ContactInfo).location ?? ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </label>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <dialog className="modal modal-open mt-0">
      <div className="modal-box w-3/4 bg-white p-7">
        <form method="dialog">
          {/* Close button */}
          <button
            className="btn btn-sm lg:btn-md lg:text-xl btn-circle btn-ghost absolute right-2 top-2"
            onClick={onCancel}
          >
            ✕
          </button>
        </form>
        <h2 className="text-base lg:text-lg pb-4">
          {t.edit}{" "}
          {section
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (str) => str.toUpperCase())}
        </h2>
        {getFields()}
        <div className="modal-action block">
          <button
            className="btn btn-success text-white w-full"
            onClick={async () => {
              setLoading(true);
              try {
                onSave(values);
              } catch (error) {
                console.error(t.saveError, error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {" "}
            {loading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <span>{t.save}</span>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default EditUserForm;
