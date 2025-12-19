import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DayColumn from './DayColumn';

// Mock dependencies
jest.mock('./colorUtils', () => ({
  createHighlightColor: () => '#000',
  getTextColor: () => '#000',
  isWeekend: () => false,
}));

jest.mock('../../hooks/useElementWidth', () => () => 500);
jest.mock('../../hooks/useChildrenWidth', () => () => 100);

describe('DayColumn Join Button', () => {
  const mockEvent = {
    _id: '1',
    name: 'Test Event',
    timeSlot: '10:00 AM',
    location: 'Test Location',
    color: '#abcdef',
    joiners: [],
    section: 'day'
  };

  const mockHandleJoin = jest.fn();
  const mockHandleDayClick = jest.fn();
  const mockHandleEventClick = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleEdit = jest.fn();
  const mockIsUserJoining = jest.fn().mockReturnValue(false);
  const mockFormatJoiners = jest.fn();

  const defaultProps = {
    date: new Date(),
    index: 0,
    dayAvailabilities: [mockEvent],
    handleDayClick: mockHandleDayClick,
    handleEventClick: mockHandleEventClick,
    handleDelete: mockHandleDelete,
    handleEdit: mockHandleEdit,
    handleJoin: mockHandleJoin,
    isUserJoining: mockIsUserJoining,
    formatJoiners: mockFormatJoiners,
    userPreferences: { color: '#000' },
    isMobile: false,
    activeEventId: null,
    darkMode: false,
  };

  it('calls handleJoin when Join button is clicked', () => {
    render(<DayColumn {...defaultProps} />);

    // Join button is inside an IconButton, check by text
    const joinButton = screen.getByText('Join');
    fireEvent.click(joinButton);

    expect(mockHandleJoin).toHaveBeenCalledTimes(1);
    expect(mockHandleJoin).toHaveBeenCalledWith('1');
  });

  it('does not propagate click to parent', () => {
    render(<DayColumn {...defaultProps} />);

    const joinButton = screen.getByText('Join');
    fireEvent.click(joinButton);

    expect(mockHandleEventClick).not.toHaveBeenCalled();
  });
});
