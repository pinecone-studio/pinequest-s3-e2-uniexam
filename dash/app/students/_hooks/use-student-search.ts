import { useState, useMemo } from 'react';
import { transliterate } from '../utils/search-helper';

export function useStudentSearch<T extends { name: string; course: string }>(items: T[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all"); // Курсын шүүлтүүр

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Нэрээр шүүх логик
      const query = searchQuery.toLowerCase().trim();
      const nameLower = item.name.toLowerCase();
      const matchesName = !query || 
        nameLower.includes(query) || 
        transliterate(nameLower).includes(query);

      // 2. Курсээр шүүх логик
      const matchesCourse = courseFilter === "all" || item.course === courseFilter;

      return matchesName && matchesCourse;
    });
  }, [items, searchQuery, courseFilter]);

  return {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    filteredItems,
  };
}