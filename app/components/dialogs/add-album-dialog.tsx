import DialogFrame from "./dialog-frame";
import { Album } from "@/app/model/album";
import AddAlbum from "./add-album";

export default function AddAlbumDialog(
  { onClose }: { onClose: () => void }
) {
  return (
    <DialogFrame onClose={onClose}>
      <AddAlbum />
    </DialogFrame>
  );
}


