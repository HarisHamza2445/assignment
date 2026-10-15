import { Button, Col, Row } from 'react-bootstrap';
import FilterSelect from '../common/FilterSelect';
import SearchBox from '../common/SearchBox';
import { DEPARTMENTS, EMPLOYEE_SORT_OPTIONS, EMPLOYEE_STATUSES } from '../../constants';

function EmployeeFilters({ filters, onChange, onClear }) {
  const sortValue = filters.sortBy ? `${filters.sortBy}:${filters.order || 'desc'}` : '';
  const hasFilters = Object.values(filters).some(Boolean);

  const handleSortChange = (value) => {
    const [sortBy, order] = value ? value.split(':') : ['', ''];
    onChange({ sortBy, order });
  };

  return (
    <div className="filters">
      <SearchBox
        value={filters.search}
        placeholder="Search name, email or employee ID"
        onSearch={(search) => onChange({ search })}
      />
      <Row className="g-2 mt-1 align-items-center">
        <Col xs={6} md={3}>
          <FilterSelect
            label="Department"
            value={filters.department}
            options={DEPARTMENTS}
            onChange={(department) => onChange({ department })}
          />
        </Col>
        <Col xs={6} md={3}>
          <FilterSelect
            label="Status"
            value={filters.status}
            options={EMPLOYEE_STATUSES}
            onChange={(status) => onChange({ status })}
          />
        </Col>
        <Col xs={12} md={3}>
          <FilterSelect label="Sort by" value={sortValue} options={EMPLOYEE_SORT_OPTIONS} onChange={handleSortChange} />
        </Col>
        {hasFilters && (
          <Col xs="auto">
            <Button variant="link" size="sm" className="p-0" onClick={onClear}>
              Clear filters
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default EmployeeFilters;
