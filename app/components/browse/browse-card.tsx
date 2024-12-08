import Link from "next/link";
import Image from "next/image";
import type { BrowseTypeProps } from "@/app/model/browse-type-props";


export default function BrowseCard({
  title,
  image,
  bgColour,
  textColour,
  url,
}: BrowseTypeProps
) {
  return (
    <div className={`browse-card rounded-2xl flex flex-col items-center justify-center gap-4 overflow-hidden ${bgColour} ${textColour}`}>
      <h2 className="browse-card-title text-xl font-bold p-3 max-w-[152px]">
        <Link href={url} className="text-wrap">{title}</Link>
      </h2>
      <Link href={url}>

        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="browse-card-image rounded-b-2xl hover:scale-105"
          placeholder="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCABAAEABAREA/8QAGwABAAIDAQEAAAAAAAAAAAAAAAEIBgcJBQP/xAAuEAABAwQCAQIEBgMBAAAAAAABAgMEAAUGBxESCBMhCRQiMRUjQUJRgRhhcZH/2gAIAQEAAD8A6p0pUE8DmqdWf4m2nL15Uf42w7PLMNy4Gxx8q+bQYr11BKfQDXHb0lOD0kvBR5WR9PUhdXFB5HNTSlKVge+cln4bpPPcqtUhcedacbuUuK8j7tvIjLKFj/iuD/VVT85da6k0T4Ox7DjGL2uHdcdm2OLiMluM2mWLqmUyovJdA7KdWht9biuSV8rJ55q8jClqZQpxHRakgqT/AASPcf8AtfSlKUrU3lZk+D4v48Z+9sHKINhtVxx+4Wv5qUr2L0iM4htCEj6nHCojhCQVHj2Fc/dOXPbXxMvILD86y6wSLHprU640r5Raipmdc2kIUUKXwA8844kFQA6tMDr7KXy51aA4FTSlKx3YeeY3q/Br7sPL5pi2bHYD1xmupT2UGm0lRCU/uWfZKU/qogfrXMPUepdpfFH2bI3zvu4XCx6dsU5yPYMeiuqQJISodmGT7cD2Aflcd1q/Lb69fyrdeEWea4xfWp0EM6xwX3Asov2LR7d+JsCW/HYuL5jLSz27r7MONfUAeSDyeeatH96mlKVVX4oEK9zvCXYTdkDhLQtz0pLZ9zGRPYU5/QABP+gaxrb8ORZ/GPRvj7pLIl41a9nzbLiYvsE9XY9pcgrlSXmlD7vPIaUOeR2Li/fk81oK8/DA0rcNpbG03iVwvdlvkHFLLlGE3J+eXSVrVJjSW5KeAFpMiO0olASpHrDrwAEm3fw9dl5rtLxWxS97Dkvy8gtrkyyTJb6uzskxJC2ULWr9y+iUpUoklSkkk8k1ZGlKV52RY9ZMtsFxxfJLaxcLTd4rsGdEfTy2+w4kocbUP4KSR/dVKtHi7tzUdnia2sQsO1tYWG8sX3FbdfLs9aMhxiSy56jCYs1ttxt9DaivgLDZ6rUgkoJSfP3HO37ePIDWlwsmN2/VVwzK133ADkE6e1eHGUutN3BC2o7BQj1kfIvekXFlHdf1JIHCrRab1NiejtaWLVuEtPptNijlptyQsLfkOKUVuvuqAAU444ta1EADlR4AHArNKUpUE8AmuQPnt59+UmsvKS+4BgGUOYjYsQdjNxYaYDDvz/dht0vvqdQouJX3ISkEJCQPbtyo2l3HuGVn2JeI0+fARA2Jl2c4zkv4AzyH2opjOi4O9FfUhhLb6/dX6KAPPB4uyOOBx9qmlKUrSu//AA90L5Kuw7js7Dy9ebcgNQ7zAkrhz2UAlQR6qD9aQSSErCgkkkAEmo054h6a0rlEvP7HBvF9zCayYz2SZLdXrpcvR446JddPDY49j0AJHsSR7VuulK//2Q=="
        />
      </Link>
    </div>
  )
}