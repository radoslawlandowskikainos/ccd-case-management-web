import { EventLogTableComponent } from './event-log-table.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { CaseViewEvent } from '../../core/cases/case-view-event.model';
import { By } from '@angular/platform-browser';
import { DatePipe } from '../palette/utils/date.pipe';

describe('EventLogTableComponent', () => {

  const EVENTS: CaseViewEvent[] = [
    {
      id: 5,
      timestamp: '2017-05-10T10:00:00.000',
      summary: 'Case updated again!',
      comment: 'Latest update',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'smith',
      user_first_name: 'justin'
    },
    {
      id: 4,
      timestamp: '2017-05-09T16:07:03.973',
      summary: 'Case updated!',
      comment: 'Plop plop',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'chan',
      user_first_name: 'phillip'
    }
  ];
  const SELECTED_EVENT = EVENTS[0];

  const $TABLE_HEADERS = By.css('table>thead>tr>th');
  const $TABLE_ROWS = By.css('table>tbody>tr');

  const COL_DATE = 0;
  const COL_AUTHOR = 1;
  const COL_EVENT = 2;

  let fixture: ComponentFixture<EventLogTableComponent>;
  let component: EventLogTableComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          EventLogTableComponent,
          DatePipe
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(EventLogTableComponent);
    component = fixture.componentInstance;

    component.events = EVENTS;
    component.selected = SELECTED_EVENT;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render a table with 3 columns', () => {
    let headers = de.queryAll($TABLE_HEADERS);

    expect(headers.length).toBe(3);

    expect(headers[COL_DATE].nativeElement.textContent).toBe('Date');
    expect(headers[COL_AUTHOR].nativeElement.textContent).toBe('Author');
    expect(headers[COL_EVENT].nativeElement.textContent).toBe('Event');
  });

  it('should render a row for each event', () => {
    let rows = de.queryAll($TABLE_ROWS);

    expect(rows.length).toBe(EVENTS.length);

    let firstRowCells = rows[0].queryAll(By.css('td'));

    expect(firstRowCells.length).toBe(3);
    let firstEvent = EVENTS[0];

    expect(firstRowCells[COL_DATE].nativeElement.textContent).toBe('May 10, 2017');
    expect(firstRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Justin SMITH');
    expect(firstRowCells[COL_EVENT].nativeElement.textContent).toBe(firstEvent.event_name);

    let secondRowCells = rows[1].queryAll(By.css('td'));

    expect(secondRowCells.length).toBe(3);
    let secondEvent = EVENTS[1];

    expect(secondRowCells[COL_DATE].nativeElement.textContent).toBe('May 9, 2017');
    expect(secondRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Phillip CHAN');
    expect(secondRowCells[COL_EVENT].nativeElement.textContent).toBe(secondEvent.event_name);
  });

  it('should highlight the row selected', () => {
    let rows = de.queryAll($TABLE_ROWS);

    expect(rows[0].classes['EventLogTable-Selected']).toBeTruthy();
    expect(rows[1].classes['EventLogTable-Selected']).toBeFalsy();
  });

  it('should change the selected row when another row is clicked', () => {
    let rows = de.queryAll($TABLE_ROWS);

    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.selected).toBe(EVENTS[1]);
    expect(rows[0].classes['EventLogTable-Selected']).toBeFalsy();
    expect(rows[1].classes['EventLogTable-Selected']).toBeTruthy();
  });

  it('should fire onSelect event when another row is clicked', () => {
    spyOn(component.onSelect, 'emit');

    let rows = de.queryAll($TABLE_ROWS);

    rows[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.onSelect.emit).toHaveBeenCalledWith(EVENTS[1]);
  });
});
