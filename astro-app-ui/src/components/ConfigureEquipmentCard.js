import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Stack,
  Input,
  FormLabel,
  Select,
  Option,
  Autocomplete,
} from "@mui/joy";
import ConfigureTabsCard, { ConfigureTabPanel } from "./ConfigureTabsCard";
import { TELESCOPES, CAMERAS, EYE_PIECES, BINOS } from "../constants/equipment";
import { EQUIP_MODES } from "../utils/equipment";

function parseFloatSafe(v, defaultValue) {
  if (!v) {
    return defaultValue;
  }
  return parseFloat(v);
}

const FIELDS = [
  {
    label: "Scope",
    keys: ["teleName"],
    render: ({ editEq, setEditEq }) => (
      <Autocomplete
        size="sm"
        options={TELESCOPES.map((t) => t.teleName).concat(["Custom"])}
        autoHighlight={true}
        value={editEq.teleName}
        onChange={(e, v, a) => {
          if (v) {
            const tele = TELESCOPES.find((t) => t.teleName === v);
            setEditEq({
              ...editEq,
              teleName: v,
              teleFocalLength: tele.teleFocalLength,
              teleAperture: tele.teleAperture,
            });
          }
        }}
      />
    ),
  },
  {
    label: "Scope Focal Length / Aperature (mm)",
    keys: ["teleFocalLength", "teleAperture"],
    render: ({ editEq, setEditEq }) => (
      <Stack direction="row" spacing={1}>
        <Input
          size="sm"
          placeholder="1000"
          value={editEq.teleFocalLength}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              teleFocalLength: e.target.value,
              teleName: "Custom",
            })
          }
        />
        <Input
          size="sm"
          placeholder="200"
          value={editEq.teleAperture}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              teleAperture: e.target.value,
              teleName: "Custom",
            })
          }
        />
      </Stack>
    ),
  },
  {
    label: "Camera",
    keys: ["camName"],
    render: ({ editEq, setEditEq }) => (
      <Autocomplete
        size="sm"
        options={CAMERAS.map((t) => t.camName).concat(["Custom"])}
        autoHighlight={true}
        value={editEq.camName}
        onChange={(e, v, a) => {
          if (v) {
            const cam = CAMERAS.find((t) => t.camName === v);
            setEditEq({
              ...editEq,
              camName: v,
              camWidth: cam.camWidth,
              camHeight: cam.camHeight,
              camPixelWidth: cam.camPixelWidth,
              camPixelHeight: cam.camPixelHeight,
            });
          }
        }}
      />
    ),
  },
  {
    label: "Resolution (px)",
    keys: ["camWidth", "camHeight"],
    render: ({ editEq, setEditEq }) => (
      <Stack direction="row" spacing={1}>
        <Input
          size="sm"
          placeholder="9576"
          value={editEq.camWidth}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              camWidth: e.target.value,
              camName: "Custom",
            })
          }
        />
        <Input
          size="sm"
          placeholder="6388"
          value={editEq.camHeight}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              camHeight: e.target.value,
              camName: "Custom",
            })
          }
        />
      </Stack>
    ),
  },
  {
    label: "Pixel Size (µm)",
    keys: ["camPixelWidth", "camPixelHeight"],
    render: ({ editEq, setEditEq }) => (
      <Stack direction="row" spacing={1}>
        <Input
          size="sm"
          placeholder="3.8"
          value={editEq.camPixelWidth}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              camPixelWidth: e.target.value,
              camName: "Custom",
            })
          }
        />
        <Input
          size="sm"
          placeholder="3.8"
          value={editEq.camPixelHeight}
          onChange={(e) =>
            setEditEq({
              ...editEq,
              camPixelHeight: e.target.value,
              camName: "Custom",
            })
          }
        />
      </Stack>
    ),
  },
  {
    label: "Eye Piece",
    keys: ["eyeName"],
    render: ({ editEq, setEditEq }) => (
      <Autocomplete
        size="sm"
        options={EYE_PIECES.map((t) => t.eyeName).concat(["Custom"])}
        autoHighlight={true}
        value={editEq.eyeName}
        onChange={(e, v, a) => {
          if (v) {
            const eye = EYE_PIECES.find((t) => t.eyeName === v);
            setEditEq({
              ...editEq,
              eyeName: v,
              eyeFocalLength: eye.eyeFocalLength,
              eyeFOV: eye.eyeFOV,
            });
          }
        }}
      />
    ),
  },
  {
    label: "Eye Piece Focal Length (mm)",
    keys: ["eyeFocalLength"],
    render: ({ editEq, setEditEq }) => (
      <Input
        size="sm"
        placeholder="30"
        value={editEq.eyeFocalLength}
        onChange={(e) =>
          setEditEq({
            ...editEq,
            eyeFocalLength: e.target.value,
            eyeName: "Custom",
          })
        }
      />
    ),
  },
  {
    label: "Eye Piece Field of View (°)",
    keys: ["eyeFOV"],
    render: ({ editEq, setEditEq }) => (
      <Input
        size="sm"
        placeholder="56"
        value={editEq.eyeFOV}
        onChange={(e) =>
          setEditEq({
            ...editEq,
            eyeFOV: e.target.value,
            eyeName: "Custom",
          })
        }
      />
    ),
  },
  {
    label: "Binoculars",
    keys: ["binoName"],
    render: ({ editEq, setEditEq }) => (
      <Autocomplete
        size="sm"
        options={BINOS.map((t) => t.binoName).concat(["Custom"])}
        autoHighlight={true}
        value={editEq.binoName}
        onChange={(e, v, a) => {
          if (v) {
            const bino = BINOS.find((t) => t.binoName === v);
            setEditEq({
              ...editEq,
              binoName: v,
              binoActualFOV: bino.binoActualFOV,
              binoAperture: bino.binoAperture,
              binoMagnification: bino.binoMagnification,
            });
          }
        }}
      />
    ),
  },
  {
    label: "Aperture (mm)",
    keys: ["binoAperture"],
    render: ({ editEq, setEditEq }) => (
      <Input
        size="sm"
        placeholder="80"
        value={editEq.binoAperture}
        onChange={(e) =>
          setEditEq({
            ...editEq,
            binoAperture: e.target.value,
            binoName: "Custom",
          })
        }
      />
    ),
  },
  {
    label: "Magnification (x)",
    keys: ["binoMagnification"],
    render: ({ editEq, setEditEq }) => (
      <Input
        size="sm"
        placeholder="20"
        value={editEq.binoMagnification}
        onChange={(e) =>
          setEditEq({
            ...editEq,
            binoMagnification: e.target.value,
            binoName: "Custom",
          })
        }
      />
    ),
  },
  {
    label: "Actual FOV (°)",
    keys: ["binoActualFOV"],
    render: ({ editEq, setEditEq }) => (
      <Input
        size="sm"
        placeholder="3.2"
        value={editEq.binoActualFOV}
        onChange={(e) =>
          setEditEq({
            ...editEq,
            binoActualFOV: e.target.value,
            binoName: "Custom",
          })
        }
      />
    ),
  },
  {
    label: "Barlow / Reducer",
    keys: ["barlow"],
    render: ({ editEq, setEditEq }) => (
      <Select
        size="sm"
        placeholder="None (1x)"
        value={editEq.barlow}
        onChange={(e, v) => setEditEq({ ...editEq, barlow: v })}
      >
        <Option value="1">None (1x)</Option>
        <Option value="2">2x</Option>
        <Option value="3">3x</Option>
        <Option value="0.5">0.5x</Option>
      </Select>
    ),
  },
  {
    label: "Binning",
    keys: ["binning"],
    render: ({ editEq, setEditEq }) => (
      <Select
        size="sm"
        placeholder="1x1"
        value={editEq.binning}
        onChange={(e, v) => setEditEq({ ...editEq, binning: v })}
      >
        <Option value="1">1x1</Option>
        <Option value="2">2x2</Option>
        <Option value="3">3x3</Option>
        <Option value="4">4x4</Option>
        <Option value="5">5x5</Option>
      </Select>
    ),
  },
];

function ConfigureEquipmentManually({ editPos, setEditPos, mode }) {
  const fields = EQUIP_MODES.find((m) => m.mode === mode).fields;
  const fieldObjects = FIELDS.filter((f) =>
    f.keys.some((k) => fields.includes(k))
  );
  return (
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      {fieldObjects.map((fieldObj) => {
        return (
          <Box key={fieldObj.label}>
            <FormLabel sx={{ pb: 1 }}>{fieldObj.label}</FormLabel>
            {fieldObj.render({ editEq: editPos, setEditEq: setEditPos })}
          </Box>
        );
      })}
    </Stack>
  );
}

export default function ConfigureEquipmentCard({
  onSubmit,
  triggerSubmitAndCallback = null,
  showButton = true,
}) {
  const [loading, setLoading] = useState(false);
  const [editValues, setEditValues] = useState({
    teleName: "Custom",
    camName: "Custom",
    eyeName: "Custom",
    binoName: "Custom",
    barlow: "1",
    binning: "1",
    type: "VISUAL",
  });
  const tabs = EQUIP_MODES.map((mode, idx) => ({ idx, title: mode.label }));

  const curMode = EQUIP_MODES.find((m) => m.mode === editValues.type);
  const isValid = curMode.fields.every((f) => !!editValues[f]);

  const submit = useCallback(async () => {
    setLoading(true);
    const submitValues = { ...editValues };
    const floatFields = [
      "teleFocalLength",
      "teleAperture",
      "camWidth",
      "camHeight",
      "camPixelWidth",
      "camPixelHeight",
      "eyeFocalLength",
      "eyeFOV",
      "binoAperture",
      "binoMagnification",
      "binoActualFOV",
    ];
    for (let floatField of floatFields) {
      submitValues[floatField] = parseFloatSafe(submitValues[floatField], 0);
    }
    const intFields = ["barlow", "binning"];
    for (let intField of intFields) {
      submitValues[intField] = parseInt(submitValues[intField]);
    }
    setLoading(false);
    onSubmit(submitValues);
  }, [onSubmit, editValues]);

  useEffect(() => {
    if (triggerSubmitAndCallback) {
      submit().then(() => triggerSubmitAndCallback());
    }
  }, [triggerSubmitAndCallback, submit]);

  return (
    <ConfigureTabsCard
      title="Equipment"
      subtitle="Your equipment is used to render accurate views of the sky and optimize search."
      tabs={tabs}
      buttonName={showButton && "Add Equipment"}
      buttonLoading={loading}
      buttonDisabled={!isValid}
      onButtonClick={() => submit()}
      onTabChange={(idx) =>
        setEditValues({ ...editValues, type: EQUIP_MODES[idx].mode })
      }
    >
      {EQUIP_MODES.map((mode, idx) => (
        <ConfigureTabPanel idx={idx}>
          <ConfigureEquipmentManually
            editPos={editValues}
            setEditPos={setEditValues}
            mode={mode.mode}
          />
        </ConfigureTabPanel>
      ))}
    </ConfigureTabsCard>
  );
}
