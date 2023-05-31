import { useRef, useEffect, useState } from "react";

// Fontawesome
import {
  faPlay,
  faStop,
  faVolumeHigh
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// SCSS
import "../styles/player.scss";

// Radios obj
import radioObj from "../../src/objs/radios.json";

const PlayButton = ({ playing }: any) => {
  return <FontAwesomeIcon icon={!playing ? faPlay : faStop} />;
};

const LoadingButton = () => {
  return (
    <div className="spinner">
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>
  );
};

const Player = () => {
  // Const
  const errorPlay = "Playing error. The player will be reinitialized";

  // References
  const audio = useRef<HTMLAudioElement>(new Audio(radioObj[2].url));

  // Ref
  let intervalRef: any = useRef<HTMLDivElement>(null);

  // States
  const [playing, setPlaying] = useState<boolean>(false);
  const [radioList, setRadioList] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [logo, setLogo] = useState<string>(radioObj[2].logo);
  const [counter, setCounter] = useState<any>({
    sec: "00",
    min: "00",
    hour: "00"
  });
  const [volume, setVolume] = useState<any>(0.5);

  // Toggle play or pause state
  const toggle = () => {
    setPlaying(!playing);
    setRadioList(!radioList);
  };

  // Switch radio station
  const switchRadio = (id: number) => {
    // Set states
    setLogo(radioObj[id].logo);
    setRadioList(!radioList);
    setLoading(true);

    // Stop stream
    audio.current.pause();

    // Load new stream
    audio.current = new Audio(radioObj[id].url);

    // Play
    setPlaying(!playing);
  };

  // Play effects
  useEffect(() => {
    // Play or pause from playing state
    if (playing) {
      setTimeout(() => {
        let promise = audio.current.play();

        // Audio play promise
        if (promise !== null) {
          promise
            .then((_) => {
              // Reinititialze if the stream is not read after a lap of time
              setTimeout(() => {
                if (audio.current.currentTime === 0) {
                  // SetState
                  setError(errorPlay);

                  // Reload page
                  setTimeout(() => {
                    window.location.reload();
                  }, 3000);
                }
              }, 10000);

              // Set play state
              setPlaying(playing);

              // Set loading state
              setLoading(false);
            })
            .catch((err) => {
              // SetState
              setError(errorPlay);

              // Display message during 5s
              setTimeout(() => {
                // Reload page
                window.location.reload();
              }, 5000);
            });
        }
      }, 500);
    } else {
      audio.current.pause();
    }
  }, [audio, playing]);

  // Border effects
  useEffect(() => {
    // Decrease counter fnct
    const increaseDate = () => {
      if (playing) {
        // Format seconds
        const result = new Date(audio.current.currentTime * 1000)
          .toISOString()
          .slice(11, 19);

        // Split
        let split = result.split(":");

        // Object
        let obj = { sec: split[2], min: split[1], hour: split[0] };

        // Set state counter
        setCounter(obj);

        return obj;
      }
    };

    // Run fnct every seconds
    intervalRef.current = setInterval(() => {
      increaseDate();
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [playing]);

  // Volume change
  const changeVolume = () => {
    // Volume
    audio.current.volume = volume;
  };

  return (
    <>
      <div className="container">
        <div id="player">
          <div className="first">
            <div className="timer">
              <span>{counter.hour}</span>
              <span>:</span>
              <span>{counter.min}</span>
              <span>:</span>
              <span>{counter.sec}</span>
            </div>
            {!loading ? (
              <div className="button" onClick={() => toggle()}>
                <PlayButton playing={playing} />
              </div>
            ) : (
              <div className="button loading">
                <LoadingButton />
              </div>
            )}
            <div
              className="radio"
              /*style={{
                backgroundImage: `url(${process.env.REACT_APP_IMG_PATH}${logo})`
              }}*/
            >
              <img
                src={`${process.env.REACT_APP_IMG_PATH}${logo}`}
                alt="logo"
              />
            </div>
          </div>
          <div className="audio-volume">
            <span>Volume </span>
            <input
              className="volume"
              type="range"
              min="0"
              max="1"
              value={volume}
              onChange={(e) => {
                setVolume(e.target.value);
                changeVolume();
              }}
              step="0.01"
            />
            <FontAwesomeIcon icon={faVolumeHigh} />
          </div>
          {error !== "" ? (
            <div className="error">
              <span>{error}</span>
            </div>
          ) : null}
          <div className="second">
            <div
              className={`${
                radioList ? "radio-list" : "radio-list radio-list-off"
              }`}
            >
              {radioObj.map((radio, i) => {
                return (
                  <div key={i} className="radio-container">
                    <div>
                      <img
                        src={`${process.env.REACT_APP_IMG_PATH}${radio.flag}`}
                        alt="flag"
                      />
                    </div>
                    <div>
                      <span
                        onClick={
                          radioList ? () => switchRadio(radio.id) : () => null
                        }
                        className="radio-name"
                      >
                        {radio.name}
                      </span>
                      <div className="radio-infos">
                        <span>{radio.state}</span>
                        <span> - </span>
                        <span>{radio.city}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
