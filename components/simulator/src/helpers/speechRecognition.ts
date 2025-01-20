import {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from "../interfaces/speechRecognition.interface";

export const handleOnVoice = (
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setIsActiveSpeechRecognition: React.Dispatch<React.SetStateAction<boolean>>,
  inputRef: React.RefObject<HTMLInputElement | null>
): void => {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsActiveSpeechRecognition(true);
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setIsActiveSpeechRecognition(false);
      const text = event.results[0][0].transcript;
      setMessage(text);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onnomatch = () => {
      setIsActiveSpeechRecognition(false);
      console.log("I didn't recognise your words. Please try again.");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsActiveSpeechRecognition(false);
      console.log("Error occurred in recognition: " + event.error);
    };
  } else {
    console.log("No available SpeechRecognition!");
  }
};
