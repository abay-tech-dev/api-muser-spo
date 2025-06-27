import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Récupère userId depuis l’URL après callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  // Auto-refresh toutes les 1 seconde
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

  // Formatage timer (mm:ss)
  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Barres audio animées à gauche
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

  if (!userId) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#181818"
      }}>
        <a href="/api/auth/spotify/login">
          <button style={{
            padding: "1rem 2.5rem",
            borderRadius: 999,
            background: "#1DB954",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            fontSize: "1.2rem",
            boxShadow: "0 2px 16px #1DB95422",
            cursor: "pointer"
          }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify logo" width={30} style={{ verticalAlign: "middle", marginRight: 14, filter: "invert(1)" }} />
            Connecter Spotify
          </button>
        </a>
      </div>
    );
  }

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
          filter: "blur(30px)",
        }} />
      )}
      {/* NOIR OPACITÉ 50% */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        background: "rgba(0,0,0,0.5)",
      }} />

      {/* CONTENU */}
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
        {/* BARRES AUDIO */}
        <AudioBars />

        {/* POCHETTE */}
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
              Pas de cover
            </div>
          )}
        </div>

        {/* INFOS TRACK */}
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
              {/* PROGRESS BAR + TIMER */}
              <div style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 14
              }}>
                {/* TIMER DÉBUT */}
                <span style={{ fontSize: 15, color: "#b7b7b7", minWidth: 44, textAlign: "right" }}>
                  {formatTime(track.progress_ms)}
                </span>
                {/* BARRE */}
                <div style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  background: "#b7b7b7",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(track.progress_ms / track.item.duration_ms) * 100}%`,
                    background: "#fff",
                    transition: "width 0.6s cubic-bezier(.45,0,.55,1)"
                  }} />
                </div>
                {/* TIMER FIN */}
                <span style={{ fontSize: 15, color: "#b7b7b7", minWidth: 44 }}>
                  {formatTime(track.item.duration_ms)}
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
              ) : "Aucune lecture détectée"}
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
