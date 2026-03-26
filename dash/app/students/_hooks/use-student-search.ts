import { useState, useMemo } from 'react';
import { transliterate } from '../utils/search-helper';

export function useStudentSearch<T extends { name: string }>(items: T[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Хэрэв хайлт хоосон бол бүх өгөгдлийг буцаана
    if (!query) return items;

    return items.filter((item) => {
      const nameLower = item.name.toLowerCase();
      
      // Логик: 
      // 1. Кирилл нэр дотор хайх (Тэмүүлэн)
      // 2. Кирилл нэрийг латин болгож хөрвүүлээд хайх (Temuulen)
      return (
        nameLower.includes(query) || 
        transliterate(nameLower).includes(query)
      );
    });
  }, [items, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}