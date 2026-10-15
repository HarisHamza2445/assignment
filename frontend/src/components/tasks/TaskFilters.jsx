import { Button, Col, Form, Row } from 'react-bootstrap';
import FilterSelect from '../common/FilterSelect';
import SearchBox from '../common/SearchBox';
import { DEPARTMENTS, PRIORITIES, TASK_SORT_OPTIONS, TASK_STATUSES } from '../../constants';

function TaskFilters({ filters, onChange, onClear }) {
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
        placeholder="Search title or employee"
        onSearch={(search) => onChange({ search })}
      />
      <Row className="g-2 mt-1">
        <Col xs={6} md={4} lg={2}>
          <FilterSelect
            label="Department"
            value={filters.department}
            options={DEPARTMENTS}
            onChange={(department) => onChange({ department })}
          />
        </Col>
        <Col xs={6} md={4} lg={2}>
          <FilterSelect
            label="Priority"
            value={filters.priority}
            options={PRIORITIES}
            onChange={(priority) => onChange({ priority })}
          />
        </Col>
        <Col xs={6} md={4} lg={2}>
          <FilterSelect
            label="Status"
            value={filters.status}
            options={TASK_STATUSES}
            onChange={(status) => onChange({ status })}
          />
        </Col>
        <Col xs={6} md={4} lg={2}>
          <FilterSelect label="Sort by" value={sortValue} options={TASK_SORT_OPTIONS} onChange={handleSortChange} />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <div className="date-range">
            <span className="date-range__label">Due:</span>
            <Form.Control
              size="sm"
              type="date"
              value={filters.dueFrom}
              max={filters.dueTo || undefined}
              onChange={(e) => onChange({ dueFrom: e.target.value })}
              aria-label="Due from"
            />
            <span>-</span>
            <Form.Control
              size="sm"
              type="date"
              value={filters.dueTo}
              min={filters.dueFrom || undefined}
              onChange={(e) => onChange({ dueTo: e.target.value })}
              aria-label="Due to"
            />
          </div>
        </Col>
      </Row>
      <div className="filters__footer">
        <Form.Check
          type="switch"
          id="overdue-only"
          label="Overdue only"
          checked={filters.overdue === 'true'}
          onChange={(e) => onChange({ overdue: e.target.checked ? 'true' : '' })}
        />
        {hasFilters && (
          <Button variant="link" size="sm" className="p-0" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export default TaskFilters;
