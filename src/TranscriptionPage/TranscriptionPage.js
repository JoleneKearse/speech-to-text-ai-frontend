import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import TimePicker from "../TimePicker/TimePicker";
import { toast, ToastContainer } from "react-toastify";
import styles from "./TranscriptionPage.module.css";

// helper functions to convert time to seconds
const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time
    .split(":")
    .map((value) => parseInt(value, 10));
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

const timeToMinutesAndSeconds = (time) => {
  const totalSeconds = timeToSeconds(time);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const TranscriptionPage = () => {
  const [uploading, setUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:10:00");
  const [audioDuration, setAudioDuration] = useState(null);

  const handleStartTimeChange = (newStartTime) => {
    const startTimeSeconds = timeToSeconds(newStartTime);
    const endTimeSeconds = timeToSeconds(endTime);
    if (startTimeSeconds >= endTimeSeconds) {
      const newEndTimeSeconds = Math.min(
        startTimeSeconds + 600,
        audioDuration || 0
      );
      const newEndTime = secondsToTime(newEndTimeSeconds);
      setEndTime(newEndTime);
    }
    setStartTime(newStartTime);
  };

  const getAudioDuration = (file) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    const file = acceptedFiles[0];
    if (!file.type.startsWith("audio/") || file.size > 400 * 1024 * 1024) {
      return;
    }
    setAudioFile(file);
    getAudioDuration(file);
  }, []);

  const transcribeAudio = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      audioFile && formData.append("file", audioFile);
      formData.append("startTime", timeToMinutesAndSeconds(startTime));
      formData.append("endTime", timeToMinutesAndSeconds(endTime));

      const backendUrl = process.env.speech_to_text_backend_url;
      const response = await axios.post(
        `${backendUrl}/api/transcribe`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTranscription(response.data.transcription);
      toast.success("Transcription successful.");
    } catch (error) {
      toast.error("An error occured during transcription.");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: "audio/*",
    });

  return (
    <div className={styles.container}>
      <ToastContainer className="toast" />
      <h1 className="centeredText">Speech to Text Transcriptions</h1>
      <div
        {...getRootProps()}
        className={[styles.dropzone, styles.centeredText].join(" ")}
        // ${isDragActive ? backgroundColor='green' : isDragReject ? backgroundColor='red' : backgroundColor='gray'}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className={styles["dropzoneText"]}>Drop the audio file here.</p>
        ) : audioFile ? (
          <p>Selected file: {audioFile.name}</p>
        ) : (
          <p>Drag & drop an audio file here, or click to select a file.</p>
        )}
      </div>
      <div>
        <TimePicker
          id="start-time"
          label="Start Time:"
          value={startTime}
          onChange={handleStartTimeChange}
          maxDuration={audioDuration || Infinity}
        />
        <TimePicker
          id="end-time"
          label="End Time:"
          value={endTime}
          onChange={setEndTime}
          maxDuration={audioDuration || Infinity}
        />
      </div>
      {uploading && <p>Uploading & transcribing...</p>}
      {transcription && (
        <div>
          <h2 className={styles.centeredText}>Transcription</h2>
          <p>{transcription}</p>
        </div>
      )}
      <button
        onClick={transcribeAudio}
        disabled={uploading || !audioFile}
        className={styles.transcribeBtn}
      >
        Transcribe
      </button>
    </div>
  );
};

export default TranscriptionPage;
