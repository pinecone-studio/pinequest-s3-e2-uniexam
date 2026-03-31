/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { transliterate } from "../utils/search-helper";

const normalize = (str: string) =>
  str.toLowerCase().replace(/\s+/g, " ").trim();

export function useStudentSearch<
  T extends { name: string; course: string; major: string }
>(items: T[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string[]>([]);
  const [majorFilter, setMajorFilter] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
  return items.filter((item) => {
    const query = searchQuery.toLowerCase();

    const matchesName =
      !query ||
      item.name.toLowerCase().includes(query) ||
      transliterate(item.name).includes(query);

    const matchesCourse =
      courseFilter.length === 0 ||
      courseFilter.includes(item.course);

    const matchesMajor =
      majorFilter.length === 0 ||
      majorFilter.includes(item.major);

    return matchesName && matchesCourse && matchesMajor;
  });
}, [items, searchQuery, courseFilter, majorFilter]);

  return {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    majorFilter,
    setMajorFilter,
    filteredItems,
  };
}