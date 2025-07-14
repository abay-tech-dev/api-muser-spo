import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // --- GET USER ID FROM URL ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  // --- FETCH TRACK EVERY SECOND ---
  useEffect(() => {
    if (!userId) return;
    const fetchTrack = async () => {
      setLoading(true);
      const res = await fetch(`/api/spotify/current?userId=${userId}`);
      const data = await res.json();
      setTrack(data);
      setLoading(false);
    };
    fetchTrack();
    intervalRef.current = setInterval(fetchTrack, 1000);
    return () => clearInterval(intervalRef.current);
  }, [userId]);

  // --- FORMAT TIME ---
  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  // --- ANIMATED AUDIO BARS ---
  const AudioBars = () => (
    <div style={{ display: 'flex', alignItems: 'end', height: 38, gap: 6, marginRight: 16 }}>
      {[18, 34, 22, 40, 19].map((h, i) => (
        <div key={i}
          style={{
            width: 7,
            height: h,
            background: "#1db954",
            borderRadius: 4,
            animation: `wave 1.2s ${i * 0.13}s infinite cubic-bezier(.45,0,.55,1) alternate`
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          to { height: 48px }
        }
      `}</style>
    </div>
  );

  // --- FRONT PAGE ---
  if (!userId) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #191414 65%, #1DB954 110%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'system-ui', sans-serif",
        color: "#fff"
      }}>
        {/* COMPANY LOGO */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 34,
          gap: 12,
          flexDirection: "column"
        }}>
          <img
            src="/logo.png" // <--- Change this path to your real logo!
            alt="Company Logo"
            width={96}
            height={96}
            style={{
              borderRadius: 22,
              boxShadow: "0 2px 16px #1db95444, 0 1px 8px #0006",
              objectFit: "contain",
              background: "#222",
            }}
          />
          <h1 style={{
            fontWeight: 800,
            fontSize: "2.6rem",
            margin: 0,
            letterSpacing: "-.5px",
            textShadow: "0 2px 16px #0008",
            color: "#fff"
          }}>
            Your Company
          </h1>
        </div>

        {/* SUBTITLE */}
        <p style={{
          fontSize: "1.24rem",
          color: "#b7b7b7",
          fontWeight: 500,
          marginBottom: 38,
          maxWidth: 390,
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          Instantly view the music you’re listening to on Spotify, effortlessly.<br/>
          <span style={{ color: "#1db954", fontWeight: 700 }}>
            Connect your Spotify account
          </span> to enable live display.
        </p>

        {/* CONNECT SPOTIFY BUTTON */}
        <a href="/api/auth/spotify/login" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "1.1rem 2.8rem",
            borderRadius: 999,
            background: "linear-gradient(90deg, #1DB954, #1ed760)",
            color: "#191414",
            border: "none",
            fontWeight: 700,
            fontSize: "1.28rem",
            boxShadow: "0 2px 22px #1DB95433",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 18,
            transition: "transform .16s"
          }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify logo"
              width={32}
              style={{
                filter: "invert(0)",
                background: "#fff",
                borderRadius: "50%",
                padding: 4
              }}
            />
            Connect Spotify
          </button>
        </a>
        <div style={{
          color: "#fff",
          opacity: 0.8,
          fontSize: 15,
          marginTop: 18,
          fontWeight: 500,
          textAlign: "center",
          maxWidth: 340,
          letterSpacing: ".03em"
        }}>
          <span>
            You need to connect Spotify to activate music integration.<br />
            We never have access to your password.
          </span>
        </div>
      </div>
    );
  }

  // --- SPOTIFY WIDGET ---
  const coverUrl = track?.item?.album?.images?.[0]?.url;

  return (
    <div style={{
      width: 800,
      height: 200,
      margin: "60px auto",
      position: "relative",
      borderRadius: 40,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      boxShadow: "0 8px 40px #0008",
      background: "#111",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#fff",
    }}>
      {/* BACKGROUND BLUR */}
      {coverUrl && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(15px)",
        }} />
      )}
      {/* BLACK OVERLAY */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        background: "rgba(0,0,0,0.2)",
        transition: "background 0.2s"
      }} />

      {/* CONTENT */}
      <div style={{
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        paddingLeft: 34,
        paddingRight: 36,
        gap: 30,
      }}>
        {/* AUDIO BARS */}
        <AudioBars />

        {/* COVER */}
        <div style={{ position: "relative" }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="cover"
              width={125}
              height={125}
              style={{
                borderRadius: 30,
                boxShadow: "0 2px 18px #0008, 0 1px 8px #1DB95433",
                objectFit: "cover",
                border: "2.5px solid #222"
              }}
            />
          ) : (
            <div style={{
              width: 125,
              height: 125,
              borderRadius: 30,
              background: "#232323",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontStyle: "italic"
            }}>
              No cover
            </div>
          )}
        </div>

        {/* TRACK INFOS */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          justifyContent: "center",
        }}>
          {track?.item ? (
            <>
              <div style={{
                fontWeight: 700,
                fontSize: 32,
                color: "#fff",
                letterSpacing: "-.5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {track.item.name}
              </div>
              <div style={{
                color: "#1db954",
                fontWeight: 600,
                fontSize: 21,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {track.item.artists.map(a => a.name).join(', ')}
              </div>
              <div style={{
                color: "#b7b7b7",
                fontWeight: 500,
                fontSize: 18,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {track.item.album.name}
              </div>
              {/* PROGRESS BAR + TIMERS */}
              <div style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                {/* PROGRESS BAR */}
                <div style={{
                  width: 380,
                  height: 8,
                  borderRadius: 4,
                  background: "#b7b7b7",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(track.progress_ms / track.item.duration_ms) * 100}%`,
                    background: "#fff",
                    transition: "width 0.6s cubic-bezier(.45,0,.55,1)"
                  }} />
                </div>
                {/* TIMERS */}
                <span style={{
                  fontSize: 17,
                  color: "#fff",
                  minWidth: 88,
                  textAlign: "right",
                  letterSpacing: "0.5px",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap"
                }}>
                  {formatTime(track.progress_ms)}<span style={{ color: '#b7b7b7' }}> / </span>{formatTime(track.item.duration_ms)}
                </span>
              </div>
            </>
          ) : (
            <div style={{ color: "#fff", fontStyle: "italic", fontSize: 21 }}>
              {loading ? (
                <div style={{
                  width: 32, height: 32, border: "5px solid #1DB95444",
                  borderTop: "5px solid #1DB954",
                  borderRadius: "50%",
                  animation: "spin 1.1s linear infinite",
                  margin: "0 auto"
                }} />
              ) : "No playback detected"}
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
