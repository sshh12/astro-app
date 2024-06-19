import React from "react";
import ProfileLocationCard from "../components/ProfileLocationCard";
import ProfileEquipmentCard from "../components/ProfileEquipmentCard";
import BaseImagePage from "../components/BaseImagePage";

export default function ImageEquipmentPage() {
  return (
    <BaseImagePage tabIdx={1}>
      <ProfileLocationCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
    </BaseImagePage>
  );
}
