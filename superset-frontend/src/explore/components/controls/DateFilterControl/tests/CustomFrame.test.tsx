/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import {
  render,
  screen,
  userEvent,
  waitForElementToBeRemoved,
  waitFor,
} from 'spec/helpers/testing-library';
import { CustomFrame } from '../components';

const TODAY = '2024-06-03';
jest.useFakeTimers();
jest.setSystemTime(new Date(TODAY).getTime());

const emptyValue = '';
const nowValue = 'now : now';
const todayValue = 'today : today';
const todayNowValue = 'today : now';
const specificValue = '2021-03-16T00:00:00 : 2021-03-17T00:00:00';
const relativeNowValue = `DATEADD(DATETIME("now"), -7, day) : DATEADD(DATETIME("now"), 7, day)`;
const relativeTodayValue = `DATEADD(DATETIME("today"), -7, day) : DATEADD(DATETIME("today"), 7, day)`;

const mockStore = configureStore([thunk]);
const store = mockStore({
  common: { locale: 'en' },
});

// case when common.locale is not populated
const emptyStore = mockStore({});

// case when common.locale is populated with invalid locale
const invalidStore = mockStore({ common: { locale: 'invalid_locale' } });

test('renders with default props', async () => {
  render(<CustomFrame onChange={jest.fn()} value={emptyValue} />, {
    store,
  });
  expect(screen.getByLabelText('Loading')).toBeVisible();
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getByText('Configure custom time range')).toBeInTheDocument();
  expect(screen.getByText('Relative Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  expect(screen.getByText('Days Before')).toBeInTheDocument();
  expect(screen.getByText('Specific Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'calendar' })).toBeInTheDocument();
});

test('renders with empty store', () => {
  render(<CustomFrame onChange={jest.fn()} value={emptyValue} />, {
    store: emptyStore,
  });
  expect(screen.getByText('Configure custom time range')).toBeInTheDocument();
  expect(screen.getByText('Relative Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  expect(screen.getByText('Days Before')).toBeInTheDocument();
  expect(screen.getByText('Specific Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'calendar' })).toBeInTheDocument();
});

test('renders since and until with specific date/time with default locale', () => {
  render(<CustomFrame onChange={jest.fn()} value={specificValue} />, {
    store: emptyStore,
  });
  expect(screen.getAllByText('Specific Date/Time').length).toBe(2);
  expect(screen.getAllByRole('img', { name: 'calendar' }).length).toBe(2);
});

test('renders with invalid locale', () => {
  render(<CustomFrame onChange={jest.fn()} value={emptyValue} />, {
    store: invalidStore,
  });
  expect(screen.getByText('Configure custom time range')).toBeInTheDocument();
  expect(screen.getByText('Relative Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  expect(screen.getByText('Days Before')).toBeInTheDocument();
  expect(screen.getByText('Specific Date/Time')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'calendar' })).toBeInTheDocument();
});

test('renders since and until with specific date/time with invalid locale', () => {
  render(<CustomFrame onChange={jest.fn()} value={specificValue} />, {
    store: invalidStore,
  });
  expect(screen.getAllByText('Specific Date/Time').length).toBe(2);
  expect(screen.getAllByRole('img', { name: 'calendar' }).length).toBe(2);
});

test('renders since and until with specific date/time', async () => {
  render(<CustomFrame onChange={jest.fn()} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getAllByText('Specific Date/Time').length).toBe(2);
  expect(screen.getAllByRole('img', { name: 'calendar' }).length).toBe(2);
});

test('renders since and until with relative date/time', async () => {
  render(<CustomFrame onChange={jest.fn()} value={relativeNowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getAllByText('Relative Date/Time').length).toBe(2);
  expect(screen.getAllByRole('spinbutton').length).toBe(2);
  expect(screen.getByText('Days Before')).toBeInTheDocument();
  expect(screen.getByText('Days After')).toBeInTheDocument();
});

test('renders since and until with Now option', async () => {
  render(<CustomFrame onChange={jest.fn()} value={nowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getAllByText('Now').length).toBe(2);
});

test('renders since and until with Midnight option', async () => {
  render(<CustomFrame onChange={jest.fn()} value={todayValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getAllByText('Midnight').length).toBe(2);
});

test('renders anchor with now option', async () => {
  render(<CustomFrame onChange={jest.fn()} value={relativeNowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getByText('Anchor to')).toBeInTheDocument();
  expect(screen.getByLabelText('Now')).toBeInTheDocument();
  expect(screen.getByLabelText('Date/Time')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Select date')).not.toBeInTheDocument();
});

test('renders anchor with date/time option', async () => {
  render(<CustomFrame onChange={jest.fn()} value={relativeTodayValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  expect(screen.getByText('Anchor to')).toBeInTheDocument();
  expect(screen.getByLabelText('Now')).toBeInTheDocument();
  expect(screen.getByLabelText('Date/Time')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
});

test('triggers onChange when the anchor changes', async () => {
  const onChange = jest.fn();
  render(<CustomFrame onChange={onChange} value={relativeNowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  userEvent.click(screen.getByRole('radio', { name: 'Date/Time' }));
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when the value changes', async () => {
  const onChange = jest.fn();
  render(<CustomFrame onChange={onChange} value={emptyValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  userEvent.click(screen.getByRole('img', { name: 'up' }));
  expect(onChange).toHaveBeenCalled();
});

test('triggers onChange when the mode changes', async () => {
  const onChange = jest.fn();
  render(<CustomFrame onChange={onChange} value={todayNowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  userEvent.click(screen.getByTitle('Midnight'));
  expect(await screen.findByTitle('Relative Date/Time')).toBeInTheDocument();
  userEvent.click(screen.getByTitle('Relative Date/Time'));
  userEvent.click(screen.getAllByTitle('Now')[1]);
  expect(
    await screen.findByText('Configure custom time range'),
  ).toBeInTheDocument();
  userEvent.click(screen.getAllByTitle('Specific Date/Time')[1]);
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
});

test('triggers onChange when the grain changes', async () => {
  const onChange = jest.fn();
  render(<CustomFrame onChange={onChange} value={relativeNowValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  userEvent.click(screen.getByText('Days Before'));
  expect(await screen.findByText('Weeks Before')).toBeInTheDocument();
  userEvent.click(screen.getByText('Weeks Before'));
  userEvent.click(screen.getByText('Days After'));
  expect(await screen.findByText('Weeks After')).toBeInTheDocument();
  userEvent.click(screen.getByText('Weeks After'));
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
});

test('triggers onChange when the date changes', async () => {
  const onChange = jest.fn();
  render(<CustomFrame onChange={onChange} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  const inputs = screen.getAllByPlaceholderText('Select date');
  userEvent.click(inputs[0]);
  userEvent.click(screen.getAllByText('Now')[0]);
  userEvent.click(inputs[1]);
  userEvent.click(screen.getAllByText('Now')[1]);
  expect(onChange).toHaveBeenCalledTimes(2);
});

test('should translate Date Picker', async () => {
  const onChange = jest.fn();
  const store = mockStore({
    common: { locale: 'fr' },
  });
  render(<CustomFrame onChange={onChange} value={specificValue} />, {
    store,
  });
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));
  userEvent.click(screen.getAllByRole('img', { name: 'calendar' })[0]);
  expect(screen.getByText('2021')).toBeInTheDocument();

  expect(screen.getByText('lu')).toBeInTheDocument();
  expect(screen.getByText('ma')).toBeInTheDocument();
  expect(screen.getByText('me')).toBeInTheDocument();
  expect(screen.getByText('je')).toBeInTheDocument();
  expect(screen.getByText('ve')).toBeInTheDocument();
  expect(screen.getByText('sa')).toBeInTheDocument();
  expect(screen.getByText('di')).toBeInTheDocument();
});

test('calls onChange when START Specific Date/Time is selected', async () => {
  const onChange = jest.fn();
  render(
    <CustomFrame
      onChange={onChange}
      value={specificValue}
      isOverflowingFilterBar
    />,
    { store },
  );

  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));

  const specificDateTimeOptions = screen.getAllByText('Specific Date/Time');
  expect(specificDateTimeOptions.length).toBe(2);

  const calendarIcons = screen.getAllByRole('img', { name: 'calendar' });
  userEvent.click(calendarIcons[0]);

  const randomDate = screen.getByTitle('2021-03-11');
  userEvent.click(randomDate);

  const okButton = screen.getByText('OK');
  userEvent.click(okButton);

  expect(onChange).toHaveBeenCalled();
});

test('calls onChange when END Specific Date/Time is selected', async () => {
  const onChange = jest.fn();
  render(
    <CustomFrame
      onChange={onChange}
      value={specificValue}
      isOverflowingFilterBar
    />,
    { store },
  );

  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));

  const specificDateTimeOptions = screen.getAllByText('Specific Date/Time');
  expect(specificDateTimeOptions.length).toBe(2);

  const calendarIcons = screen.getAllByRole('img', { name: 'calendar' });
  userEvent.click(calendarIcons[1]);

  const randomDate = screen.getByTitle('2021-03-28');
  userEvent.click(randomDate);

  const okButton = screen.getByText('OK');
  userEvent.click(okButton);

  expect(onChange).toHaveBeenCalled();
});

test('calls onChange when a date is picked from anchor mode date picker', async () => {
  const onChange = jest.fn();
  render(
    <CustomFrame
      onChange={onChange}
      value={relativeTodayValue}
      isOverflowingFilterBar
    />,
    { store },
  );

  await waitForElementToBeRemoved(() => screen.queryByLabelText('Loading'));

  const relativeDateTimeOptions = screen.getAllByText('Relative Date/Time');
  expect(relativeDateTimeOptions.length).toBe(2);

  await waitFor(() =>
    expect(screen.getByText('Anchor to')).toBeInTheDocument(),
  );

  const dateTimeRadio = screen.getByRole('radio', { name: 'Date/Time' });

  expect(dateTimeRadio).toBeChecked();

  const calendarIcon = screen.getByRole('img', { name: 'calendar' });
  userEvent.click(calendarIcon);

  const randomDate = screen.getByTitle('2024-06-05');
  userEvent.click(randomDate);

  const okButton = screen.getByText('OK');
  userEvent.click(okButton);

  expect(onChange).toHaveBeenCalled();
});
