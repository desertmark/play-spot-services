import { DayOfWeek } from './dto';
import { Slot } from './facilities/slots.dto';

export type ISlot = {
  open_time: string | Date;
  close_time: string | Date;
  day_of_week: Slot['day_of_week'];
};

export class SlotUtil {
  static toDateSlot<T extends ISlot>(slot: ISlot): T {
    slot.open_time = SlotUtil.timeStringToDate(slot.open_time as string);
    slot.close_time = SlotUtil.timeStringToDate(slot.close_time as string);
    return slot as T;
  }

  static toStringSlot<T extends ISlot>(slot: ISlot): T {
    slot.open_time = SlotUtil.dateToTimestring(slot.open_time as Date);
    slot.close_time = SlotUtil.dateToTimestring(slot.close_time as Date);
    return slot as T;
  }

  static isOverlapping(slot: ISlot, other_slot: ISlot) {
    if (slot.day_of_week !== other_slot.day_of_week) {
      return false;
    }

    const slot_open_time = SlotUtil.normalizeTime(slot.open_time).getTime();
    const slot_close_time = SlotUtil.normalizeTime(slot.close_time).getTime();

    const other_slot_open_time = SlotUtil.normalizeTime(
      other_slot.open_time,
    ).getTime();
    const other_slot_close_time = SlotUtil.normalizeTime(
      other_slot.close_time,
    ).getTime();

    /**
     * Slot      :|------|
     * Other Slot:|------|
     *
     * Check this separately to allow:
     * Slot:      |----|
     * Other Slot:     |---|
     *
     * and
     *
     * Slot:           |----|
     * Other Slot: |---|
     */
    if (
      slot_open_time == other_slot_open_time &&
      slot_close_time == other_slot_close_time
    ) {
      return true;
    }

    /**
     * Slot      :|------|
     * Other Slot:  |--|-|--|
     */
    if (
      slot_open_time <= other_slot_open_time &&
      slot_close_time > other_slot_open_time
    ) {
      return true;
    }

    /**
     * Slot      :   |--|-|-----|
     * Other Slot:|-------|
     */
    if (
      slot_open_time > other_slot_open_time &&
      slot_open_time < other_slot_close_time
    ) {
      return true;
    }

    return false;
  }

  static dateToTimestring(time: Date) {
    return time.toLocaleTimeString(undefined, {
      hour12: false,
      timeStyle: 'short',
    });
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
}
