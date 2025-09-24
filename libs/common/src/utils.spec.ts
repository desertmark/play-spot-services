import { SlotUtil } from './utils';
import { Slot } from './facilities/slots.dto';
import { DayOfWeek } from './dto';

describe('SlotUtil', () => {
  let mockSlot: Slot;

  beforeEach(() => {
    mockSlot = {
      id: 1,
      unitId: 1,
      dayOfWeek: 1,
      openTime: '09:00',
      closeTime: '17:00',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Slot;
  });

  describe('toDateSlot', () => {
    it('should convert time strings to Date objects', () => {
      const result = SlotUtil.toDateSlot(mockSlot);

      expect(result.openTime).toBeInstanceOf(Date);
      expect(result.closeTime).toBeInstanceOf(Date);
      expect(result.dayOfWeek).toBe(1);
    });

    it('should preserve other properties', () => {
      const result = SlotUtil.toDateSlot(mockSlot);

      expect(result.unitId).toBe(mockSlot.unitId);
      expect(result.dayOfWeek).toBe(mockSlot.dayOfWeek);
    });
  });

  describe('toStringSlot', () => {
    it('should convert Date objects to time strings', () => {
      const dateSlot = {
        ...mockSlot,
        openTime: new Date(Date.UTC(1900, 0, 1, 9, 0)),
        closeTime: new Date(Date.UTC(1900, 0, 1, 17, 0)),
      };

      const result = SlotUtil.toStringSlot(dateSlot);

      expect(typeof result.openTime).toBe('string');
      expect(typeof result.closeTime).toBe('string');
      expect(result.openTime).toBe('09:00');
      expect(result.closeTime).toBe('17:00');
    });
  });

  describe('isOverlapping', () => {
    it('should return false for slots on different days', () => {
      const otherSlot = {
        openTime: '10:00',
        closeTime: '16:00',
        dayOfWeek: 2,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(false);
    });

    it('should return true for identical slots', () => {
      const otherSlot = {
        openTime: '09:00',
        closeTime: '17:00',
        dayOfWeek: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true when first slot contains second slot', () => {
      const otherSlot = {
        openTime: '10:00',
        closeTime: '16:00',
        dayOfWeek: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should return true when second slot contains first slot', () => {
      const otherSlot = {
        openTime: '08:00',
        closeTime: '18:00',
        dayOfWeek: 1,
      };
      expect(SlotUtil.isOverlapping(mockSlot, otherSlot)).toBe(true);
    });

    it('should work with Date objects', () => {
      const slotWithDates = {
        openTime: new Date(Date.UTC(1900, 0, 1, 9, 0, 0)),
        closeTime: new Date(Date.UTC(1900, 0, 1, 17, 0, 0)),
        dayOfWeek: 1,
      };
      const otherSlotWithDates = {
        openTime: new Date(Date.UTC(1900, 0, 1, 10, 0, 0)),
        closeTime: new Date(Date.UTC(1900, 0, 1, 16, 0, 0)),
        dayOfWeek: 1,
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
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '17:00',
        },
        {
          unitId: 1,
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '16:00',
        },
        {
          unitId: 1,
          dayOfWeek: 3,
          openTime: '08:00',
          closeTime: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameUnit(slots as Slot[])).toBe(true);
    });

    it('Should return false if slots belong to different units', () => {
      const slots: Partial<Slot>[] = [
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '17:00',
        },
        {
          unitId: 2,
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '16:00',
        },
        {
          unitId: 1,
          dayOfWeek: 3,
          openTime: '08:00',
          closeTime: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameUnit(slots as Slot[])).toBe(false);
    });
  });

  describe('areAllSlotsOfTheSameWeekDay', () => {
    it('Should return true if all slots belong to the same week day', () => {
      const slots: Partial<Slot>[] = [
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '17:00',
        },
        {
          unitId: 2,
          dayOfWeek: 1,
          openTime: '10:00',
          closeTime: '16:00',
        },
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '08:00',
          closeTime: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameWeekDay(slots as Slot[])).toBe(true);
    });

    it('Should return false if slots belong to different week days', () => {
      const slots: Partial<Slot>[] = [
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '17:00',
        },
        {
          unitId: 2,
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '16:00',
        },
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '08:00',
          closeTime: '18:00',
        },
      ];
      expect(SlotUtil.areAllSlotsOfTheSameWeekDay(slots as Slot[])).toBe(false);
    });
  });

  describe('areAllSlotsContiguousInTime', () => {
    it('Should return true if all slots are contiguous in time', () => {
      const slots: Partial<Slot>[] = [
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '10:00',
        },
        {
          unitId: 2,
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '11:00',
        },
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '11:00',
          closeTime: '12:00',
        },
      ];
      expect(SlotUtil.areAllSlotsContiguousInTime(slots as Slot[])).toBe(true);
    });

    it('Should return false if slots are not contiguous in time', () => {
      const slots: Partial<Slot>[] = [
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '11:30',
        },
        {
          unitId: 2,
          dayOfWeek: 2,
          openTime: '11:00',
          closeTime: '12:00',
        },
        {
          unitId: 1,
          dayOfWeek: 1,
          openTime: '13:00',
          closeTime: '14:00',
        },
      ];
      expect(SlotUtil.areAllSlotsContiguousInTime(slots as Slot[])).toBe(false);
    });
  });
});
