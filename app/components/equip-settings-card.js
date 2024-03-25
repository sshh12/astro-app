"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Text,
  List,
  ListItem,
  Dialog,
  DialogPanel,
  Title,
  Button,
  NumberInput,
  SearchSelect,
  SearchSelectItem,
  Select,
  SelectItem,
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@tremor/react";
import BadgeIconRound from "../components/badge-icon-round";
import { useAPI } from "../api";
import { TELESCOPES, EYE_PIECES, BARLOWS, CAMERAS, BINOS } from "../equipment";

const EQUIP_MODES = [
  {
    mode: "VISUAL",
    label: "Visual",
    fields: [
      "barlow",
      "teleName",
      "teleFocalLength",
      "teleAperture",
      "eyeName",
      "eyeFocalLength",
      "eyeFOV",
    ],
    desc: "Fill in the fields below to add visual observing equipment. This is for people with a telescope and an eye piece.",
  },
  {
    mode: "CAMERA",
    label: "Camera",
    fields: [
      "barlow",
      "binning",
      "teleName",
      "teleFocalLength",
      "teleAperture",
      "camName",
      "camWidth",
      "camHeight",
      "camPixelWidth",
      "camPixelHeight",
    ],
    desc: "Fill in the fields below to add astrophotography equipment. This is for people with a telescope and a camera.",
  },
  {
    mode: "BINOCULARS",
    label: "Binoculars",
    fields: ["binoName", "binoAperture", "binoMagnification", "binoActualFOV"],
    desc: "Fill in the fields below to add binocular-based observing equipment.",
  },
];

const FIELDS = {
  teleFocalLength: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Telescope Focal Length (mm)
      </Text>
      <NumberInput
        key={key}
        placeholder={600}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "teleName")}
      />
    </div>
  ),
  teleAperture: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Telescope Aperture (mm)
      </Text>
      <NumberInput
        key={key}
        placeholder={80}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "teleName")}
      />
    </div>
  ),
  teleName: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Telescope
      </Text>
      <SearchSelect
        enableClear={true}
        placeholder="Telescope"
        value={values[key]}
        onChange={(e) => {
          const newVal = { teleName: e };
          if (e !== "Custom") {
            const tele = TELESCOPES.find((t) => t.teleName === e);
            newVal.teleFocalLength = tele.teleFocalLength;
            newVal.teleAperture = tele.teleAperture;
          }
          setValues(newVal);
        }}
      >
        <SearchSelectItem key={"Custom"} value={"Custom"}>
          Custom
        </SearchSelectItem>
        {TELESCOPES.map((obj) => (
          <SearchSelectItem key={obj.teleName} value={obj.teleName}>
            {obj.teleName}
          </SearchSelectItem>
        ))}
      </SearchSelect>
    </div>
  ),
  camName: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Camera
      </Text>
      <SearchSelect
        enableClear={true}
        placeholder="Camera"
        value={values[key]}
        onChange={(e) => {
          const newVal = { camName: e };
          if (e !== "Custom") {
            const cam = CAMERAS.find((t) => t.camName === e);
            newVal.camWidth = cam.camWidth;
            newVal.camHeight = cam.camHeight;
            newVal.camPixelWidth = cam.camPixelWidth;
            newVal.camPixelHeight = cam.camPixelHeight;
          }
          setValues(newVal);
        }}
      >
        <SearchSelectItem key={"Custom"} value={"Custom"}>
          Custom
        </SearchSelectItem>
        {CAMERAS.map((obj) => (
          <SearchSelectItem key={obj.camName} value={obj.camName}>
            {obj.camName}
          </SearchSelectItem>
        ))}
      </SearchSelect>
    </div>
  ),
  camWidth: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Resolution - Width (px)
      </Text>
      <NumberInput
        key={key}
        placeholder={9576}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "camName")}
      />
    </div>
  ),
  camHeight: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Resolution - Height (px)
      </Text>
      <NumberInput
        key={key}
        placeholder={6388}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "camName")}
      />
    </div>
  ),
  camPixelWidth: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Pixel Size - Width (µm)
      </Text>
      <NumberInput
        key={key}
        placeholder={3.76}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "camName")}
      />
    </div>
  ),
  camPixelHeight: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Pixel Size - Height (µm)
      </Text>
      <NumberInput
        key={key}
        placeholder={3.76}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "camName")}
      />
    </div>
  ),
  eyeFocalLength: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Eye Piece Focal Length (mm)
      </Text>
      <NumberInput
        key={key}
        placeholder={30}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "eyeName")}
      />
    </div>
  ),
  eyeFOV: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Eye Piece Field of View (°)
      </Text>
      <NumberInput
        key={key}
        placeholder={56}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "eyeName")}
      />
    </div>
  ),
  eyeName: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Eye Piece
      </Text>
      <SearchSelect
        enableClear={true}
        placeholder="Eye Piece"
        key={key}
        value={values[key]}
        onChange={(e) => {
          const newVal = { eyeName: e };
          if (e !== "Custom") {
            const eye = EYE_PIECES.find((t) => t.eyeName === e);
            newVal.eyeFocalLength = eye.eyeFocalLength;
            newVal.eyeFOV = eye.eyeFOV;
          }
          setValues(newVal);
        }}
      >
        <SearchSelectItem key={"Custom"} value={"Custom"}>
          Custom
        </SearchSelectItem>
        {EYE_PIECES.map((obj) => (
          <SearchSelectItem key={obj.eyeName} value={obj.eyeName}>
            {obj.eyeName}
          </SearchSelectItem>
        ))}
      </SearchSelect>
    </div>
  ),
  barlow: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Barlow / Reducer
      </Text>
      <Select
        enableClear={false}
        placeholder="None (1x)"
        key={key}
        value={values[key]}
        onChange={(e) => {
          setValues({ barlow: e });
        }}
      >
        {BARLOWS.map((obj) => (
          <SelectItem key={obj.value} value={obj.value}>
            {obj.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  ),
  binning: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Binning
      </Text>
      <Select
        enableClear={false}
        placeholder="1x1"
        key={key}
        value={values[key]}
        onChange={(e) => {
          setValues({ binning: e });
        }}
      >
        {[1, 2, 3, 4, 5].map((bin) => (
          <SelectItem key={bin} value={"" + bin}>
            {bin}x{bin}
          </SelectItem>
        ))}
      </Select>
    </div>
  ),
  binoAperture: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Aperture (mm)
      </Text>
      <NumberInput
        key={key}
        placeholder={80}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "binoName")}
      />
    </div>
  ),
  binoMagnification: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Magnification (x)
      </Text>
      <NumberInput
        key={key}
        placeholder={20}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "binoName")}
      />
    </div>
  ),
  binoActualFOV: ({ key, values, setCustom }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Actual FOV (°)
      </Text>
      <NumberInput
        key={key}
        placeholder={3.2}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setCustom(e.target.value, "binoName")}
      />
    </div>
  ),
  binoName: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Binoculars
      </Text>
      <SearchSelect
        enableClear={true}
        placeholder="Binoculars"
        value={values[key]}
        onChange={(e) => {
          const newVal = { binoName: e };
          if (e !== "Custom") {
            const eye = BINOS.find((t) => t.binoName === e);
            newVal.binoActualFOV = eye.binoActualFOV;
            newVal.binoAperture = eye.binoAperture;
            newVal.binoMagnification = eye.binoMagnification;
          }
          setValues(newVal);
        }}
      >
        <SearchSelectItem key={"Custom"} value={"Custom"}>
          Custom
        </SearchSelectItem>
        {BINOS.map((obj) => (
          <SearchSelectItem key={obj.binoName} value={obj.binoName}>
            {obj.binoName}
          </SearchSelectItem>
        ))}
      </SearchSelect>
    </div>
  ),
};

function equipName(equip) {
  if (equip.type === "VISUAL") {
    return `${equip.teleName} (${equip.teleFocalLength}mm) / ${equip.eyeName} (${equip.eyeFocalLength}mm)`;
  } else if (equip.type === "CAMERA") {
    return `${equip.teleName} (${equip.teleFocalLength}mm) / ${equip.camName}`;
  } else if (equip.type === "BINOCULARS") {
    return `${equip.binoName} (${equip.binoMagnification}x) / ${equip.camName}`;
  }
}

export default function EquipSettingsCard({
  title,
  icon,
  color,
  open,
  setOpen,
  onAdd,
  onDelete,
  setActive,
}) {
  const { ready, user } = useAPI();

  const [tabIdx, setTabIdx] = useState(0);
  const [editValues, setEditValues] = useState({});
  useEffect(() => {
    if (open) {
      setEditValues({
        teleFocalLength: "",
        teleAperture: "",
        teleName: "",
        camName: "",
        camWidth: "",
        camHeight: "",
        camPixelWidth: "",
        camPixelHeight: "",
        eyeFocalLength: "",
        eyeFOV: "",
        eyeName: "",
        barlow: "1",
        binning: "1",
        binoAperture: "",
        binoMagnification: "",
        binoActualFOV: "",
        binoName: "",
      });
    }
  }, [open]);

  const fixedEditValues = { ...editValues };
  if (!fixedEditValues.barlow) {
    fixedEditValues.barlow = "1";
  }
  if (!fixedEditValues.binning) {
    fixedEditValues.binning = "1";
  }
  if (!fixedEditValues.teleName) {
    fixedEditValues.teleName = "Custom";
  }
  if (!fixedEditValues.camName) {
    fixedEditValues.camName = "Custom";
  }
  if (!fixedEditValues.eyeName) {
    fixedEditValues.eyeName = "Custom";
  }
  if (!fixedEditValues.binoName) {
    fixedEditValues.binoName = "Custom";
  }
  const curMode = EQUIP_MODES[tabIdx];
  fixedEditValues.type = curMode.mode;
  const fieldsReady = curMode.fields.every(
    (f) => fixedEditValues[f] !== undefined && fixedEditValues[f] !== ""
  );

  const canSave = ready && fieldsReady;

  const existingEquipment = user?.equipment || [];
  existingEquipment.sort((a, b) => b.active - a.active);

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-3">{title}</Title>

          {ready && (
            <Flex className="flex-col">
              <List>
                {existingEquipment.map((eq) => (
                  <ListItem className="flex-col items-start" key={eq.id}>
                    <Text color="slate-400">{equipName(eq)}</Text>
                    <Flex className="mt-2">
                      <Button
                        variant="light"
                        color="red"
                        onClick={() => onDelete(eq)}
                      >
                        Delete
                      </Button>
                      {!eq.active && (
                        <Button
                          variant="light"
                          color="blue"
                          onClick={() => setActive(eq)}
                        >
                          Set Primary
                        </Button>
                      )}
                    </Flex>
                  </ListItem>
                ))}
              </List>

              <div
                style={{ height: "2px" }}
                className="w-full bg-gray-800"
              ></div>

              <Flex className="mt-2">
                <TabGroup onIndexChange={(e) => setTabIdx(e)} index={tabIdx}>
                  <TabList variant="line" defaultValue="VISUAL">
                    {EQUIP_MODES.map((m) => (
                      <Tab key={m.mode} value={m.mode}>
                        {m.label}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {EQUIP_MODES.map((m) => {
                      const modeCfg = EQUIP_MODES.find(
                        (e) => e.mode === m.mode
                      );
                      const inputElements = modeCfg.fields.map((f) => {
                        return FIELDS[f]({
                          key: f,
                          values: editValues,
                          setValues: (vals) =>
                            setEditValues({ ...editValues, ...vals }),
                          setCustom: (v, nameKey) => {
                            setEditValues({
                              ...editValues,
                              [nameKey]: "Custom",
                              [f]: v,
                            });
                          },
                        });
                      });
                      return (
                        <TabPanel key={m.mode}>
                          <p className="mt-3 mb-3 leading-6">{m.desc}</p>
                          {inputElements}
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </TabGroup>
              </Flex>
            </Flex>
          )}

          <Flex className="mt-4 justify-between">
            <Button
              variant="light"
              onClick={() => setOpen(false)}
              color="slate"
            >
              Close
            </Button>
            {canSave && (
              <Button variant="primary" onClick={() => onAdd(fixedEditValues)}>
                Add
              </Button>
            )}
            {!canSave && (
              <Button variant="primary" color="grey" disabled>
                Add
              </Button>
            )}
          </Flex>
        </DialogPanel>
      </Dialog>
      <Card onClick={() => setOpen(true)} className="cursor-pointer">
        <Flex alignItems="start">
          <div className="truncate">
            <Text color="white">{title}</Text>
          </div>
          <BadgeIconRound icon={icon} color={color} />
        </Flex>
        <List className="pt-2">
          {existingEquipment.map((eq) => (
            <ListItem key={eq.id}>
              {eq.active && (
                <Text color="slate-400">
                  <b>{equipName(eq)}</b>
                </Text>
              )}
              {!eq.active && <Text color="slate-400">{equipName(eq)}</Text>}
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}
