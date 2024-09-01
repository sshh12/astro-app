import { Divider } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";

export default function FeedbackCard() {
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography level="title-md">Feedback</Typography>
        <Typography level="body-sm">
          Have questions, feedback, or suggestions? Let us know!
        </Typography>
      </Box>
      <Divider />
      <CardOverflow sx={{ paddingRight: 2, paddingBottom: 2 }}>
        <CardActions sx={{ alignSelf: "flex-end" }}>
          <Button
            size="sm"
            variant="solid"
            onClick={() =>
              window.open("https://forms.gle/k7MQkr4hKpCU7pW97", "_blank")
            }
          >
            Give Feedback
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
