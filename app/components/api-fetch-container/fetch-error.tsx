import TextButton from "../buttons/text-button"
import OutlinedIcon from "@/app/components/icons/outlined-icon"

export default function ErrorComponent(
    props: {
        onReloadClick: () => void
    }
) {
    return (
        <div className="flex w-full flex-col gap-4">
            <h1>Đã xảy ra lỗi</h1>
            <TextButton className="w-full" onClick={props.onReloadClick}>
                <OutlinedIcon icon="refresh" />
                <p>Nhấn vào đây để tải lại</p>
            </TextButton>
        </div>
    )
}