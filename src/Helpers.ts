export default class Helpers {
  public static wait(seconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (seconds <= 0) resolve();
      else setTimeout(resolve, seconds * 1000);
    });
  }
}
