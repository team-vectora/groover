    import { useState, useEffect } from 'react';

import React from "react";
import Link from "next/link";

const ProjectCard = ({ isYourProfile, project, setCurrentProject, handleClickFork }) => {
        useEffect(() => {
             console.log(project)
         }, []);
  return (
        <div
          key={project.id}
          onClick={() => setCurrentProject(project)}
          className="
            rounded-lg
            p-6
            transition-shadow
            duration-200
            bg-[var(--bg-darker)]
            text-[var(--text)]
            text-[1.1rem]
            w-full
            cursor-pointer
            hover:shadow-lg
          "
          style={{
            boxShadow: "0 2px 8px var(--primary)",
          }}
          onMouseEnter={(e) =>
            e.currentTarget.style.boxShadow = "0 8px 12px var(--primary)"
          }
          onMouseLeave={(e) =>
            e.currentTarget.style.boxShadow = "0 2px 8px var(--primary)"
          }
        >
      <h2>{project.title || "Sem título"}</h2>
      <p>{project.description || "Sem descrição"}</p>

      <div className="flex justify-between text-[1rem] text-[var(--text-lighter)] mt-3">
        <span>BPM: {project.bpm || "--"}</span>
        <span>
          {project.created_at
            ? new Date(project?.created_at).toLocaleDateString()
            : "--"}
        </span>
      </div>

      <div className="flex items-center justify-start pt-2">
        <Link
          href={`/editor/${isYourProfile ? "" : "view"}/${project.id}`}
          className="
            mr-4
            bg-[var(--primary)]
            p-3
            rounded-full
            h-12
            w-12
            flex
            items-center
            justify-center
            border-none
            transition
            duration-300
            ease-in-out
            hover:bg-[var(--primary-light)]
            hover:shadow-md
            hover:fill-[var(--text)]
          "
        >
          <svg
            fill="#ffffff"
            viewBox="0 0 32 32"
            className="h-[30px] w-[30px] stroke-[var(--text)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5.991,12.003l-0.001,0c-1.105,0 -2.002,0.897 -2.002,2.002c-0,1.105 0.897,2.002 2.002,2.002c1.104,-0 2.001,-0.897 2.001,-2.002l0,-7.122c0,-0 6.001,-0.75 6.001,-0.75l0.003,3.867c-1.105,0 -2.002,0.897 -2.002,2.002c0,1.105 0.897,2.001 2.002,2.001c1.105,0 2.002,-0.896 2.002,-2.001l-0.006,-7.003c0,-0.286 -0.123,-0.559 -0.338,-0.749c-0.215,-0.19 -0.501,-0.278 -0.786,-0.242l-8,1c-0.5,0.062 -0.876,0.488 -0.876,0.992l0,6.003Z"></path>
            <path d="M12.617,20.597c-0.813,0.815 -1.326,1.33 -1.326,1.33c-0.186,0.187 -0.29,0.44 -0.291,0.703l-0.009,4.368c-0.001,0.265 0.104,0.52 0.292,0.708c0.188,0.188 0.442,0.294 0.708,0.294l4.427,0c0.265,-0 0.518,-0.105 0.706,-0.291l1.305,-1.3l-5.812,-5.812Zm1.411,-1.417l5.818,5.818l6.946,-6.914c0.773,-0.774 1.208,-1.823 1.208,-2.916c-0,-1.094 -0.435,-2.143 -1.208,-2.916c-0.003,-0.004 -0.006,-0.007 -0.009,-0.01c-0.774,-0.773 -1.823,-1.208 -2.916,-1.208c-1.094,0 -2.143,0.435 -2.916,1.208c-1.958,1.958 -4.822,4.83 -6.923,6.938Z"></path>
          </svg>
        </Link>

        <button
          onClick={() => handleClickFork(project)}
          className="
            mr-4
            bg-[var(--primary)]
            p-3
            rounded-full
            h-12
            w-12
            flex
            items-center
            justify-center
            border-none
            transition
            duration-300
            ease-in-out
            hover:bg-[var(--primary-light)]
            hover:shadow-md
            hover:fill-[var(--text)]
          "
        >
          <svg
            fill="#ffffff"
            viewBox="0 0 1920 1920"
            className="h-[30px] w-[30px] stroke-[var(--text)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1468.183 451.76v1468.184H0V451.76h1468.183ZM1920 0v1468.296h-338.812V338.812H451.704V0H1920ZM338.812 1016.446h790.56V903.509h-790.56v112.937Zm0 225.874h564.686v-112.937H338.812v112.937Zm0 225.988h790.56v-113.05h-790.56v113.05Z" />
          </svg>
        </button>

        <button
          onClick={() => handleClickFork(project)}
          className={`
            mr-4
            bg-[var(--primary)]
            p-3
            rounded-full
            h-12
            w-12
            flex
            items-center
            justify-center
            border-none
            transition
            duration-300
            ease-in-out
            hover:bg-[var(--primary-light)]
            hover:shadow-md
            hover:fill-[var(--text)]
            ${isYourProfile ? "block" : "hidden"}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="22"
            width="37"
            fill="#4c4e30"
            viewBox="0 0 50 50"
          >
            <path d="..."></path>
          </svg>
        </button>
      </div>
    </div>

  );
};

export default ProjectCard;
