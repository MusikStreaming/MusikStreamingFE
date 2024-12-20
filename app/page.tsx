import Content from "./content";
import { Suspense } from "react";

export default function Home() {
  return <Suspense>
    <Content />
  </Suspense>;
}
