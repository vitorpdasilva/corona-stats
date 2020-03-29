import React from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'semantic-ui-react';
import './style.css';

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const RankingTable = (props) => {
  const { items, requestSort, sortConfig } = useSortableData(props.data);
  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  return (
    <>
      <Link to="/">&larr; Back to data and filters</Link>
      <div style={{ width: '100%', overflow: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'white' }}>
                Country
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => requestSort('confirmed')}
                  className={getClassNamesFor('confirmed')}
                >
                  Confirmed
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => requestSort('deaths')}
                  className={getClassNamesFor('deaths')}
                >
                  Deaths
                </button>
              </th>
              <th>
              <button
                  type="button"
                  onClick={() => requestSort('mortality')}
                  className={getClassNamesFor('mortality')}
                >
                  Mortality
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => requestSort('recovered')}
                  className={getClassNamesFor('recovered')}
                >
                  Recover
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => requestSort('active')}
                  className={getClassNamesFor('active')}
                >
                  Active
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={Math.random()}>
                <td style={{ position: 'sticky', left: 0, background: 'white' }}>
                  <div style={{ width: 20, float: 'left' }}>{Number(index + 1)}</div>
                  <Flag name={item.country.toLowerCase()} />
                  <Link to={`/?country=${item.iso2}`}>
                    {item.country}
                  </Link>
                </td>
                <td>{item.confirmed}</td>
                <td>{item.deaths}</td>
                <td>{(Math.round(item.deaths * 100) / item.confirmed).toFixed(1)}%</td>
                <td>{item.recovered}</td>
                <td>{item.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RankingTable;
