import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import styles from "./TimePicker.module.css";

const TimePicker = ({ id, label, value, onChange, maxDuration }) => {
  const [hours, minutes, seconds] = value
    .split(":")
    .map((value) => parseInt(value, 10));
  // calculate max values
  const validMaxDuration = maxDuration === Infinity ? 0 : maxDuration;
  const maxHours = Math.floor(validMaxDuration / 3600);
  const maxMinutes = Math.floor((validMaxDuration % 3600) / 60);
  const maxSeconds = Math.floor(validMaxDuration % 60);
  // create time options & state hooks to manage them
  const hoursOptions = Array.from(
    { length: Math.max(0, maxHours) + 1 },
    (_, i) => i
  );
  const minutesSecondsOptions = Array.from({ length: 60 }, (_, i) => i);

  const [minuteOptions, setMinuteOptions] = useState(minutesSecondsOptions);
  const [secondOptions, setSecondOptions] = useState(minutesSecondsOptions);

  // update current value by calling onChange prop
  const updateValue = (newHours, newMinutes, newSeconds) => {
    onChange(
      `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
        2,
        "0"
      )}:${String(newSeconds).padStart(2, "0")}`
    );
  };

  // update minute & second options function
  const updateMinuteAndSecondOptions = useCallback(
    (newHours, newMinutes) => {
      const minutesSecondsOptions = Array.from({ length: 60 }, (_, i) => i);
      let newMinuteOptions = minutesSecondsOptions;
      let newSecondOptions = minutesSecondsOptions;
      if (newHours === maxHours) {
        newMinuteOptions = Array.from({ length: Math.max(0, maxMinutes) + 1 });
        if (newMinutes === maxMinutes) {
          newSecondOptions = Array.from(
            { length: Math.max(0, maxSeconds) + 1 },
            (_, i) => i
          );
        }
      }
      setMinuteOptions(newMinuteOptions);
      setSecondOptions(newSecondOptions);
    },
    [maxHours, maxMinutes, maxSeconds]
  );

  useEffect(() => {
    updateMinuteAndSecondOptions(hours, minutes);
  }, [hours, minutes, updateMinuteAndSecondOptions]);

  // helper functions to convert time ints to select options
  const toOption = (value) => ({
    value: value,
    label: String(value).padStart(2, "0"),
  });

  const fromOption = (option) => option.value;

  return (
    <div className={styles.timePickerContainer}>
      <label htmlFor={`${id}--hours`} className="timePickerLabel center-text">
        {label}
      </label>
      <div>
        <div className={styles.selectLabel}>
          <span className={styles.smallText}>Hours</span>
          <span className={styles.smallText}>Minutes</span>
          <span className={styles.smallText}>Seconds</span>
        </div>
        <div className={styles.reactSelectContainer}>
          <Select
            className="react-select-container"
            id={`${id}-hours`}
            value={toOption(hours)}
            onChange={(option) => {
              const newHours = fromOption(option);
              updateValue(newHours, minutes, seconds);
              updateMinuteAndSecondOptions(newHours, minutes);
            }}
            options={hoursOptions.map(toOption)}
            isSearchable
            styles={{
              control: (basestyles, state) => ({
                ...basestyles,
                flexDirection: "row-reverse",
                height: "4em",
                marginTop: ".25em",
                marginBottom: ".5em",
                paddingTop: ".25em",
                paddingBottom: ".5em",
                border: ".1rem solid #da8bcf",
                borderColor: state.isFocused ? "#FFFFFF" : "#DA8BCF",
                backgroundColor: "#d7bad3",
                color: "#d7bad3",
              }),
            }}
          />
          <Select
            id={`${id}-minutes`}
            value={toOption(minutes)}
            onChange={(option) => {
              const newMinutes = fromOption(option);
              updateValue(hours, newMinutes, seconds);
              updateMinuteAndSecondOptions(hours, newMinutes);
            }}
            options={minuteOptions.map(toOption)}
            isSearchable
            styles={{
              control: (basestyles, state) => ({
                ...basestyles,
                flexDirection: "row-reverse",
                height: "4em",
                marginTop: ".25em",
                marginBottom: ".5em",
                paddingTop: ".25em",
                paddingBottom: ".5em",
                border: ".1rem solid #da8bcf",
                borderColor: state.isFocused ? "#FFFFFF" : "#DA8BCF",
                backgroundColor: "#d7bad3",
                color: "#d7bad3",
              }),
            }}
          />
          <Select
            id={`${id}-seconds`}
            value={toOption(seconds)}
            onChange={(option) => {
              const newSeconds = fromOption(option);
              updateValue(hours, minutes, newSeconds);
            }}
            options={secondOptions.map(toOption)}
            isSearchable
            styles={{
              control: (basestyles, state) => ({
                ...basestyles,
                flexDirection: "row-reverse",
                height: "4em",
                marginTop: ".25em",
                marginBottom: ".5em",
                paddingTop: ".25em",
                paddingBottom: ".5em",
                border: ".1rem solid #da8bcf",
                borderColor: state.isFocused ? "#FFFFFF" : "#DA8BCF",
                backgroundColor: "#d7bad3",
                color: "#d7bad3",
              }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
