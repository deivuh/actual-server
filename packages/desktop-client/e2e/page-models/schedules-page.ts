import { type Locator, type Page } from '@playwright/test';

type ScheduleEntry = {
  payee?: string;
  account?: string;
  amount?: number;
};

export class SchedulesPage {
  readonly page: Page;
  readonly addNewScheduleButton: Locator;
  readonly schedulesTableRow: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addNewScheduleButton = this.page.getByRole('button', {
      name: 'Add new schedule',
    });
    this.schedulesTableRow = this.page.getByTestId('table').getByTestId('row');
  }

  /**
   * Add a new schedule
   */
  async addNewSchedule(data: ScheduleEntry) {
    await this.addNewScheduleButton.click();

    await this._fillScheduleFields(data);

    await this.page.getByRole('button', { name: 'Add' }).click();
  }

  /**
   * Retrieve the row element for the nth-schedule.
   * 0-based index
   */
  getNthScheduleRow(index: number) {
    return this.schedulesTableRow.nth(index);
  }

  /**
   * Retrieve the data for the nth-schedule.
   * 0-based index
   */
  getNthSchedule(index: number) {
    const row = this.getNthScheduleRow(index);

    return {
      payee: row.getByTestId('payee'),
      account: row.getByTestId('account'),
      date: row.getByTestId('date'),
      status: row.getByTestId('status'),
      amount: row.getByTestId('amount'),
    };
  }

  /**
   * Create a transaction for the nth-schedule.
   * 0-based index
   */
  async postNthSchedule(index: number) {
    await this._performNthAction(index, 'Post transaction today');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Complete the nth-schedule.
   * 0-based index
   */
  async completeNthSchedule(index: number) {
    await this._performNthAction(index, 'Complete');
    await this.page.waitForTimeout(1000);
  }

  async _performNthAction(index: number, actionName: string | RegExp) {
    const row = this.getNthScheduleRow(index);
    const actions = row.getByTestId('actions');

    await actions.getByRole('button').click();
    await this.page.getByRole('button', { name: actionName }).click();
  }

  async _fillScheduleFields(data: ScheduleEntry) {
    if (data.payee) {
      await this.page.getByRole('textbox', { name: 'Payee' }).fill(data.payee);
      await this.page.keyboard.press('Enter');
    }

    if (data.account) {
      await this.page
        .getByRole('textbox', { name: 'Account' })
        .fill(data.account);
      await this.page.keyboard.press('Enter');
    }

    if (data.amount) {
      await this.page.getByLabel('Amount').fill(String(data.amount));
      // For some readon, the input field does not trigger the change event on tests
      // but it works on the browser. We can revisit this once migration to
      // react aria components is complete.
      await this.page.keyboard.press('Enter');
    }
  }
}
