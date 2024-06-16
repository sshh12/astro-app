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
import { OBJECT_SORTS } from "../utils/object";
import { useBackend } from "../providers/backend";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

export default function SkyObjectDisplayModal({ open, setOpen }) {
  const { objDisplay, setObjDisplay } = useBackend();
  if (!objDisplay) return <></>;
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography>Display Options</Typography>
        <FormLabel>Sort</FormLabel>
        <FormControl>
          <Select
            placeholder="Sort by..."
            value={objDisplay.sortName}
            onChange={(_, val) =>
              setObjDisplay({ ...objDisplay, sortName: val })
            }
          >
            {OBJECT_SORTS.map((sort) => (
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
            variant={objDisplay.sortReverse ? "solid" : "outlined"}
            onClick={() => setObjDisplay({ ...objDisplay, sortReverse: true })}
          >
            <ArrowDownwardIcon />
          </IconButton>
          <IconButton
            variant={!objDisplay.sortReverse ? "solid" : "outlined"}
            onClick={() => setObjDisplay({ ...objDisplay, sortReverse: false })}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </ButtonGroup>
      </ModalDialog>
    </Modal>
  );
}
