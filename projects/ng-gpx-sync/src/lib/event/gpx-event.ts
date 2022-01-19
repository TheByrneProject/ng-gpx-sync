
export class GpxEvent {

  success: boolean = true;
  error: any;
  message: string;

  log(): string {
    return this.message;
  }

  static createEvent(message: string = 'GpxEvent', success: boolean = true, error?: any): GpxEvent {
    let event: GpxEvent = new GpxEvent();
    event.message = message;
    return event;
  }
}
