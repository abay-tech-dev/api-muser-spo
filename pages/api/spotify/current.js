import axios from "axios";
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId manquant" });

  await dbConnect();
  const user = await User.findOne({ spotifyId: userId });
  if (!user) return res.status(401).json({ error: "Utilisateur non authentifié" });

  const refresh_token = user.refresh_token;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    // Récupère access_token
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id,
        client_secret,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const { access_token } = tokenRes.data;

    // Récupère le titre en cours d'écoute
    const playerRes = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    res.status(200).json(playerRes.data);
  } catch (err) {
    res.status(400).json({ error: "Impossible de récupérer la musique", details: err.message });
  }
}
