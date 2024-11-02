import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import ButtonGroup from "@mui/joy/ButtonGroup";
import IconButton from "@mui/joy/Button";
import { OBJECT_FIELDS } from "../utils/object";
import { useBackend } from "../providers/backend";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function SkyObjectDisplayModal({ open, setOpen }) {
  const { displaySettings, setDisplaySettings } = useBackend();
  if (!displaySettings) return <></>;
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography>Display Options</Typography>
        <FormLabel>Sort By</FormLabel>
        <FormControl>
          <Select
            placeholder="Sort by..."
            value={displaySettings.sortName}
            onChange={(_, val) =>
              setDisplaySettings({ ...displaySettings, sortName: val })
            }
          >
            {OBJECT_FIELDS.map((sort) => (
              <Option key={sort.id} value={sort.id}>
                {sort.label}
              </Option>
            ))}
          </Select>
        </FormControl>
        <ButtonGroup
          variant="outlined"
          sx={{ width: "100%", justifyContent: "center" }}
        >
          <IconButton
            variant={displaySettings.sortReverse ? "solid" : "outlined"}
            onClick={() =>
              setDisplaySettings({ ...displaySettings, sortReverse: true })
            }
          >
            <ArrowDownwardIcon />
          </IconButton>
          <IconButton
            variant={!displaySettings.sortReverse ? "solid" : "outlined"}
            onClick={() =>
              setDisplaySettings({ ...displaySettings, sortReverse: false })
            }
          >
            <ArrowUpwardIcon />
          </IconButton>
        </ButtonGroup>
        <FormLabel>Badges</FormLabel>
        <FormControl>
          <Select
            multiple
            placeholder="Sort by..."
            value={displaySettings.badges}
            onChange={(_, val) =>
              setDisplaySettings({ ...displaySettings, badges: val })
            }
          >
            {OBJECT_FIELDS.map((field) => (
              <Option key={field.id} value={field.id}>
                {field.label}
              </Option>
            ))}
          </Select>
        </FormControl>
      </ModalDialog>
    </Modal>
  );
}
