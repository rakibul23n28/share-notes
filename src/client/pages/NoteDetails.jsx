import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders, timeAgo } from "../utils/Helper";
import Layout from "../components/Layout";

const NoteDetails = () => {
  const { noteid } = useParams(); // Get the dynamic noteId from the URL
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteid}`, {
          headers: getAuthHeaders(),
        });
        setNote(response.data.note);
      } catch (err) {
        setError("Failed to load the note details.");
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Layout>
      <div className="px-4 py-8">
        <div className="p-4">
          {note ? (
            <>
              <p className="mt-4 text-gray-500">
                createdAt: {timeAgo(note.createdAt)}
              </p>
              <h1 className="text-2xl font-bold">{note.title}</h1>
              <p className="mt-2">{note.content}</p>
            </>
          ) : (
            <p>No note found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NoteDetails;
