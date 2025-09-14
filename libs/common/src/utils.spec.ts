import { Slot } from './facilities';
import { SlotUtil, ISlot } from './utils';

describe('SlotUtil', () => {
  describe('timeStringToDate', () => {
    it('should convert valid time string to date', () => {
      const result = SlotUtil.timeStringToDate('09:30');
      expect(result).toEqual(new Date(Date.UTC(1900, 0, 1, 9, 30, 0)));
    });

    it('should handle zero padded times', () => {
      const result = SlotUtil.timeStringToDate('00:00');
      expect(result).toEqual(new Date(Date.UTC(1900, 0, 1, 0, 0, 0)));
    });

    it('should throw error for invalid time string', () => {
      expect(() => SlotUtil.timeStringToDate('invalid')).toThrow(
        /Failed to parse timestring: invalid to date/,
      );
    });

    it('should throw error for empty string', () => {
      expect(() => SlotUtil.timeStringToDate('')).toThrow(
        /Failed to parse timestring: .* to date/,
      );
    });
  });

  describe('normalizeTime', () => {
    it('should return normalized date when input is already a date', () => {
      const date = new Date();
      const result = SlotUtil.normalizeTime(date);
      expect(result).toEqual(
        new Date(1900, 0, 1, date.getHours(), date.getMinutes()),
      );
    });

    it('should convert string to date', () => {
      const result = SlotUtil.normalizeTime('10:45');
      expect(result).toEqual(new Date(Date.UTC(1900, 0, 1, 10, 45, 0)));
    });
  });

  describe('isOverlapping', () => {
    const mockSlot: ISlot = {
      open_time: '09:00',
      close_time: '17:00',
      day_of_week: 1,
    };

    it('should return false for different days of week', () => {
      const otherSlot: ISlot = {
        open_time: '10:00',
        close_time: '16:00',
        day_of_week: 2,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(false);
    });

    it('should return true for identical slots', () => {
      const otherSlot: ISlot = {
        open_time: '09:00',
        close_time: '17:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true when first slot contains second slot', () => {
      const otherSlot: ISlot = {
        open_time: '10:00',
        close_time: '16:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true when second slot contains first slot', () => {
      const otherSlot: ISlot = {
        open_time: '08:00',
        close_time: '18:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true for partial overlap (first slot starts earlier)', () => {
      const otherSlot: ISlot = {
        open_time: '16:00',
        close_time: '20:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true for partial overlap (second slot starts earlier)', () => {
      const otherSlot: ISlot = {
        open_time: '07:00',
        close_time: '10:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return false for adjacent non-overlapping slots', () => {
      const otherSlot: ISlot = {
        open_time: '17:00',
        close_time: '20:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(false);
    });

    it('should return false for non-overlapping slots with gap', () => {
      const otherSlot: ISlot = {
        open_time: '18:00',
        close_time: '20:00',
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(false);
    });

    it('should work with Date objects', () => {
      const slotWithDates: ISlot = {
        open_time: new Date(Date.UTC(1900, 0, 1, 9, 0, 0)),
        close_time: new Date(Date.UTC(1900, 0, 1, 17, 0, 0)),
        day_of_week: 1,
      };
      const otherSlotWithDates: ISlot = {
        open_time: new Date(Date.UTC(1900, 0, 1, 10, 0, 0)),
        close_time: new Date(Date.UTC(1900, 0, 1, 16, 0, 0)),
        day_of_week: 1,
      };
      expect(SlotUtil.isOverlapping(slotWithDates, otherSlotWithDates)).toBe(
        true,
      );
    });
  });
  describe('areAllSlotsOfTheSameUnit', () => {
    it('Should return true if all slots belong to the same unit', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '17:00',
        },
        {
          unit_id: 1,
          day_of_week: 2,
          open_time: '10:00',
          close_time: '16:00',
        },
        {
          unit_id: 1,
          day_of_week: 3,
          open_time: '08:00',
          close_time: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameUnit(slots as Slot[])).toBe(true);
    });
    it('Should return false if slots belong to different units', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '17:00',
        },
        {
          unit_id: 2,
          day_of_week: 2,
          open_time: '10:00',
          close_time: '16:00',
        },
        {
          unit_id: 1,
          day_of_week: 3,
          open_time: '08:00',
          close_time: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameUnit(slots as Slot[])).toBe(false);
    });
  });

  describe('areAllSlotsOfTheSameWeekDay', () => {
    it('Should return true if all slots belong to the same week day', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '17:00',
        },
        {
          unit_id: 2,
          day_of_week: 1,
          open_time: '10:00',
          close_time: '16:00',
        },
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '08:00',
          close_time: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameWeekDay(slots as Slot[])).toBe(true);
    });
    it('Should return false if slots belong to different week days', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '17:00',
        },
        {
          unit_id: 2,
          day_of_week: 2,
          open_time: '10:00',
          close_time: '16:00',
        },
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '08:00',
          close_time: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameWeekDay(slots as Slot[])).toBe(false);
    });
  });

  describe('areAllSlotsContiguousInTime', () => {
    it('Should return true if all slots are contiguous in time', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '10:00',
        },
        {
          unit_id: 2,
          day_of_week: 2,
          open_time: '10:00',
          close_time: '11:00',
        },
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '11:00',
          close_time: '12:00',
        },
      ];
      expect(SlotUtil.areAllSlotsContiguousInTime(slots as Slot[])).toBe(true);
    });

    it('Should return false if slots have gaps in between', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '10:00',
        },
        {
          unit_id: 2,
          day_of_week: 2,
          open_time: '11:00',
          close_time: '12:00',
        },
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '13:00',
          close_time: '14:00',
        },
      ];
      expect(SlotUtil.areAllSlotsContiguousInTime(slots as Slot[])).toBe(false);
    });

    it('Should return false if slots overlap each other', () => {
      const slots: Partial<Slot>[] = [
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '09:00',
          close_time: '11:30',
        },
        {
          unit_id: 2,
          day_of_week: 2,
          open_time: '11:00',
          close_time: '12:00',
        },
        {
          unit_id: 1,
          day_of_week: 1,
          open_time: '13:00',
          close_time: '14:00',
        },
      ];
      expect(SlotUtil.areAllSlotsContiguousInTime(slots as Slot[])).toBe(false);
    });
  });
});
