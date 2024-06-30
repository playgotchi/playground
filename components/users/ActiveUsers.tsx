import { useSelf, useOthers } from "@liveblocks/react/suspense";
import {Avatar} from "./Avatar";

import styles from "../Avatar.module.css";

import { useMemo } from "react";
import { generateRandomName } from "@/lib/utils";

const ActiveUsers = () => {
const users = useOthers();
const currentUser = useSelf();
const hasMoreUsers = users.length > 2;

const memoizedUsers = useMemo(() => {
  return(
    <div className="flex item-center justify-center gap-1 py-4">
      <div className='flex pl-3'>
        {currentUser && (
          <Avatar name='You' otherStyles='border-[3px] border-primary-purple' />
        )}

        {users.slice(0, 3).map(({ connectionId }) => {
          return (
            <Avatar
            key={connectionId}
            name={generateRandomName()}
            otherStyles='-ml-3'
          />
          );
        })}

        {hasMoreUsers && (
          <div className='z-10 -ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-black'>
            +{users.length - 2}</div>)}
      </div>
    </div>
  )
}, [users.length])

return memoizedUsers; 

};

export default ActiveUsers;

function useUsers() {
  throw new Error("Function not implemented.");
}
