import { getInitials } from "../../utils";

/** Fills its parent circle: shows the profile picture, or initials when there is none. */
const Avatar = ({ user }) =>
  user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name || "Profile"}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
    />
  ) : (
    <>{getInitials(user?.name)}</>
  );

export default Avatar;
