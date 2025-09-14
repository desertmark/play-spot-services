import { DayOfWeek } from './dto';
import { Slot } from './facilities/slots.dto';

export type AnyClass = (new (...args: any[]) => any) | object;

export type ISlot = {
  open_time: string | Date;
  close_time: string | Date;
  day_of_week: Slot['day_of_week'];
};

export type IDateSlot = {
  open_time: Date;
  close_time: Date;
  day_of_week: Slot['day_of_week'];
};

export class SlotUtil {
  static toDateSlot<T extends ISlot>(slot: ISlot): T {
    const clone = cloneInstance(slot);
    clone.open_time = SlotUtil.timeStringToDate(slot.open_time as string);
    clone.close_time = SlotUtil.timeStringToDate(slot.close_time as string);
    return clone as T;
  }

  static toStringSlot<T extends ISlot>(slot: ISlot): T {
    const clone = cloneInstance(slot);
    clone.open_time = SlotUtil.dateToTimestring(slot.open_time as Date);
    clone.close_time = SlotUtil.dateToTimestring(slot.close_time as Date);
    return clone as T;
  }

  static isOverlapping(slot: ISlot, other_slot: ISlot): boolean {
    if (slot.day_of_week !== other_slot.day_of_week) {
      return false;
    }

    const slot_open = SlotUtil.normalizeTime(slot.open_time).getTime();
    const slot_close = SlotUtil.normalizeTime(slot.close_time).getTime();
    const other_open = SlotUtil.normalizeTime(other_slot.open_time).getTime();
    const other_close = SlotUtil.normalizeTime(other_slot.close_time).getTime();

    // Dos intervalos NO se superponen si uno termina antes de que el otro comience
    // Por tanto, se superponen si esto NO es cierto
    return !(slot_close <= other_open || other_close <= slot_open);
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

  static toPrintString({ id, open_time, close_time, day_of_week }: Slot) {
    return `Slot: ${id} - day: ${DayOfWeek[day_of_week!]} - ${open_time} - ${close_time}`;
  }

  static areAllSlotsOfTheSameUnit(slots: Slot[]): boolean {
    return slots.every((slot) => slot.unit_id === slots[0].unit_id);
  }
  static areAllSlotsOfTheSameWeekDay(slots: Slot[]): boolean {
    return slots.every((slot) => slot.day_of_week === slots[0].day_of_week);
  }
  static areAllSlotsContiguousInTime(slots: Slot[]): boolean {
    return slots
      .map((s) => SlotUtil.toDateSlot<IDateSlot>(s))
      .sort((a, b) => a.open_time.getTime() - b.open_time.getTime())
      .reduce((acc, slot, ix, sorted) => {
        if (sorted[ix + 1]) {
          const areContiguous =
            slot.close_time.getTime() === sorted[ix + 1].open_time.getTime();
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
