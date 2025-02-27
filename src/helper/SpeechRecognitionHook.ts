import { useEffect, useState } from 'react';

export const useSpeechRecognition = () => {
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [recognizer, setRecognizer] = useState<SpeechRecognition>();
  const [result, setResult] = useState<string | undefined>(undefined);

  const listen = () => {
    setListening(true);
    if (recognizer) {
      recognizer.start();
    }
  };

  const onResult = (event: SpeechRecognitionEvent) => {
    setListening(false);
    console.log(event);
  };

  const onSpeechEnd = () => {
    setListening(false);
    if (recognizer) {
      recognizer.stop();
    }
  };

  const onNoMatch = () => {
    setListening(false);
    console.log("I didn't recognise your words. Please try again.");
  };

  const onError = (event: SpeechRecognitionErrorEvent) => {
    setListening(false);
    console.log('Error occurred in recognition: ', event);
  };

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setRecognizer(new SpeechRecognition());
    } else {
      console.log('Speech recognition not available');
    }
  }, []);

  useEffect(() => {
    if (recognizer) {
      recognizer.interimResults = true;
      recognizer.onresult = onResult;
      recognizer.onspeechend = onSpeechEnd;
      recognizer.onnomatch = onNoMatch;
      recognizer.onerror = onError;
      setSpeechRecognitionAvailable(true);
    }
  }, [recognizer]);

  return { speechRecognitionAvailable, listen, listening, result };
};
