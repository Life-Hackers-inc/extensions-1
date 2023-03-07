import { showToast, Toast } from "@raycast/api";
import { execSync } from "child_process";
import { getSelectedImages } from "./utils";

export default async function Command(props: { arguments: { degrees: string } }) {
  const { degrees } = props.arguments;
  const selectedImages = await getSelectedImages();

  if (selectedImages.length === 0 || (selectedImages.length === 1 && selectedImages[0] === "")) {
    await showToast({ title: "No images selected", style: Toast.Style.Failure });
    return;
  }

  if (selectedImages) {
    const pluralized = `image${selectedImages.length === 1 ? "" : "s"}`;
    try {
      const pathStrings = '"' + selectedImages.join('" "') + '"';
      execSync(`sips --rotate ${degrees} ${pathStrings}`);
      await showToast({ title: `Rotated ${selectedImages.length.toString()} ${pluralized} by ${degrees} degrees` });
    } catch {
      await showToast({
        title: `Failed to rotate ${selectedImages.length.toString()} ${pluralized}`,
        style: Toast.Style.Failure,
      });
    }
  }
}
