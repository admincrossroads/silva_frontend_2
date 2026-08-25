import { SpxFarmMark } from "@/components/brand/spx-farm-logo";

/** App icon / favicon — Farm OS / SPX Africa spiral mark */
export default function Icon() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(152 55% 28%)",
        borderRadius: "20%",
        color: "white",
      }}
    >
      <SpxFarmMark className="h-[70%] w-[70%]" />
    </div>
  );
}
