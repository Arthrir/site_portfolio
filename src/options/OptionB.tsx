import App from "../App";
import PreviewBar from "./PreviewBar";
import "./options.css";

export default function OptionB({ onNavigate }: { onNavigate?: (theme: string) => void }) {
  return (
    <div className="relative">
      <App theme="option-b" />
      <PreviewBar
        currentTheme="option-b"
        onSelectTheme={(id) => {
          if (onNavigate) {
            onNavigate(id);
          } else {
            window.location.href = id === "original" ? "/" : `/${id === "option-a" ? "optionA" : id === "option-b" ? "optionB" : "optionC"}`;
          }
        }}
      />
    </div>
  );
}
