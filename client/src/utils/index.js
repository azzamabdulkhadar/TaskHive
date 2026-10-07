import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

export { dayjs };

export const formatDate = (date, fmt = "MMM D, YYYY") => dayjs(date).format(fmt);
export const fromNow    = (date) => dayjs(date).fromNow();
export const isToday    = (date) => dayjs(date).isToday?.() ?? dayjs(date).isSame(dayjs(), "day");

export const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const greetingByHour = (name = "") => {
  const h = new Date().getHours();
  const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${part}${name ? `, ${name.split(" ")[0]}` : ""}`;
};
