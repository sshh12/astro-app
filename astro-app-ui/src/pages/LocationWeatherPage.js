import React from "react";
import ProfileLocationCard from "../components/ProfileLocationCard";
import ProfileEquipmentCard from "../components/ProfileEquipmentCard";
import BaseLocationPage from "../components/BaseLocationPage";

export default function LocationWeatherPage() {
  return (
    <BaseLocationPage tabIdx={0}>
      <ProfileLocationCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
      <ProfileEquipmentCard setOpen={() => {}} />
    </BaseLocationPage>
  );
}
