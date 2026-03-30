import type { StudentAlert, StudentStatus } from "./types";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getStatusLabel(status: StudentStatus) {
  switch (status) {
    case "online":
      return "Онлайн";
    case "offline":
      return "Офлайн";
    case "submitted":
      return "Илгээсэн";
    default:
      return "";
  }
}

export function getAlertTypeLabel(type?: StudentAlert["type"]) {
  switch (type) {
    case "phone":
      return "Утас илэрсэн";
    case "tab":
      return "Tab сольсон";
    case "headpose":
      return "Дэлгэцээс өөр тийш харсан";
    case "people":
      return "Нэмэлт хүн илэрсэн";
    default:
      return "Зөрчил илэрсэн";
  }
}
