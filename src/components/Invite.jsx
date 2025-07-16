import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const Invite = ({ invite, response, handleClickAccept, handleClickReject }) => {
  return (
    <div
      className="project-card"
    >
      <h2>{invite.from_user_id || ""}</h2>
      <p>{invite.created_at || ""}</p>
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
