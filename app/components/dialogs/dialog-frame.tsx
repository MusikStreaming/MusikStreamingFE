import OutlinedIcon from "../icons/outlined-icon";
import IconSmallButton from "../buttons/icon-small-button";

export default function DialogFrame(
  { children, onClose }: { 
    children: React.ReactNode,
    onClose: () => void 
  }
) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[--md-sys-color-surface] p-6 rounded-md w-full max-w-md h-3/4 max-h-fit overflow-auto flex flex-col justify-center">
        <div className="flex justify-end mt-2">
          <IconSmallButton onClick={onClose}>
            <OutlinedIcon icon="close" />
          </IconSmallButton>
        </div>
        <div className="h-full flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}