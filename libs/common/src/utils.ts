import { DayOfWeek } from './dto';
import { Slot } from './facilities/slots.dto';

export type AnyClass = (new (...args: any[]) => any) | object;

export type ISlot = {
  openTime: string | Date;
  closeTime: string | Date;
  dayOfWeek: Slot['dayOfWeek'];
};

export type IDateSlot = {
  openTime: Date;
  closeTime: Date;
  dayOfWeek: Slot['dayOfWeek'];
};

export class SlotUtil {
  static toDateSlot<T extends ISlot>(slot: ISlot): T {
    const clone = cloneInstance(slot);
    clone.openTime = SlotUtil.timeStringToDate(slot.openTime as string);
    clone.closeTime = SlotUtil.timeStringToDate(slot.closeTime as string);
    return clone as T;
  }

  static toStringSlot<T extends ISlot>(slot: ISlot): T {
    const clone = cloneInstance(slot);
    clone.openTime = SlotUtil.dateToTimestring(slot.openTime as Date);
    clone.closeTime = SlotUtil.dateToTimestring(slot.closeTime as Date);
    return clone as T;
  }

  static isOverlapping(slot: ISlot, otherSlot: ISlot): boolean {
    if (slot.dayOfWeek !== otherSlot.dayOfWeek) {
      return false;
    }

    const slotOpen = SlotUtil.normalizeTime(slot.openTime).getTime();
    const slotClose = SlotUtil.normalizeTime(slot.closeTime).getTime();
    const otherOpen = SlotUtil.normalizeTime(otherSlot.openTime).getTime();
    const otherClose = SlotUtil.normalizeTime(otherSlot.closeTime).getTime();

    // Dos intervalos NO se superponen si uno termina antes de que el otro comience
    // Por tanto, se superponen si esto NO es cierto
    return !(slotClose <= otherOpen || otherClose <= slotOpen);
  }

  static dateToTimestring(time: Date) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    return formatter.format(time);
  }

  static timeStringToDate(timestring: string) {
    try {
      const [hours, minutes] = timestring.split(':');
      if (
        !hours ||
        !minutes ||
        isNaN(parseInt(hours)) ||
        isNaN(parseInt(minutes))
      ) {
        throw new Error('Invalid time format');
      }
      return new Date(
        Date.UTC(1900, 0, 1, parseInt(hours), parseInt(minutes), 0),
      );
    } catch (error) {
      throw Error(
        `Failed to parse timestring: ${timestring} to date, Reason: ${error}`,
      );
    }
  }

  static normalizeTime(time: string | Date): Date {
    if (typeof time === 'string') {
      return SlotUtil.timeStringToDate(time);
    }
    return new Date(1900, 0, 1, time.getHours(), time.getMinutes());
  }

  static toPrintString({ id, openTime, closeTime, dayOfWeek }: Slot) {
    return `Slot: ${id} - day: ${DayOfWeek[dayOfWeek!]} - ${openTime} - ${closeTime}`;
  }

  static areAllSlotsOfTheSameUnit(slots: Slot[]): boolean {
    return slots.every((slot) => slot.unitId === slots[0].unitId);
  }
  static areAllSlotsOfTheSameWeekDay(slots: Slot[]): boolean {
    return slots.every((slot) => slot.dayOfWeek === slots[0].dayOfWeek);
  }
  static areAllSlotsContiguousInTime(slots: Slot[]): boolean {
    return slots
      .map((s) => SlotUtil.toDateSlot<IDateSlot>(s))
      .sort((a, b) => a.openTime.getTime() - b.openTime.getTime())
      .reduce((acc, slot, ix, sorted) => {
        if (sorted[ix + 1]) {
          const areContiguous =
            slot.closeTime.getTime() === sorted[ix + 1].openTime.getTime();
          return acc && areContiguous;
        }
        return acc;
      }, true);
  }
}

/**
 * Clones an instance of a class, maintaining its prototype chain.
 * @param instance Instance of a class
 * @returns clone of the given instance
 */
export function cloneInstance<T extends AnyClass>(instance: T): T {
  return Object.assign(
    Object.create(Object.getPrototypeOf(instance)),
    instance,
  );
}
