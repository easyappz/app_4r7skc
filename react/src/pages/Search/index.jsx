import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { UserCard } from '../../components/UserCard';
import { searchMembers } from '../../api/members';
import './Search.css';

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setMembers([]);
        setSearched(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMembers(searchQuery);
      setMembers(data);
    } catch (error) {
      console.error('Error searching members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="search-page" data-easytag="id13-src/pages/Search/index.jsx">
        <div className="search-container">
          <div className="search-header">
            <h1>Поиск пользователей</h1>
            <input
              type="text"
              className="search-input"
              placeholder="Введите имя для поиска..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="search-results">
            {loading && (
              <div className="search-message">
                <p>Загрузка...</p>
              </div>
            )}

            {!loading && !searched && (
              <div className="search-message">
                <p>Введите имя для поиска</p>
              </div>
            )}

            {!loading && searched && members.length === 0 && (
              <div className="search-message">
                <p>Пользователи не найдены</p>
              </div>
            )}

            {!loading && members.length > 0 && (
              <div className="search-grid">
                {members.map((member) => (
                  <UserCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
