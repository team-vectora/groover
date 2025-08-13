import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const Invite = ({ invite, response, handleClickAccept, handleClickReject }) => {
  return (
    <div className="project-card">
      <h2>
        <Link href={`/profile/${invite.from_user.username}`}>
          {invite.from_user.username || ""}
        </Link>
      </h2>
      <p>{new Date(invite.created_at).toLocaleString() || ""}</p>
      <p>{invite.status || ""}</p>

      <div className="button-info">
        {response ? (
          <p>{response}</p>
        ) : (
          <>
            <button
              className="button-card-project"
              onClick={() => handleClickAccept(invite.id)}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>

            <button
              className="button-card-project"
              onClick={() => handleClickReject(invite.id)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Invite;
