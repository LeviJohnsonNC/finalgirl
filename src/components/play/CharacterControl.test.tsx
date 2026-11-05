import {fireEvent,render,screen} from '@testing-library/react';
import {describe,it,expect,vi} from 'vitest';
import {CharacterControl} from './CharacterControl';
const states=[{value:'in-play',label:'In play'},{value:'saved',label:'Saved'},{value:'killed',label:'Killed'},{value:'left',label:'Left play'}];
describe('compact character outcome corrections',()=>{
 it.each(['left','left-play','away'])('restores %s through the portrait without resolving an outcome',value=>{
  const onChange=vi.fn(),onOutcome=vi.fn();
  render(<CharacterControl name="Sally" value={value} states={[...states,{value,label:'Left play'}]} present="in-play" art={{src:'/portrait.webp'}} onChange={onChange} onOutcome={onOutcome} showStatusEditor={false}/>);
  fireEvent.click(screen.getByRole('button',{name:'Add Sally'}));
  expect(onChange).toHaveBeenCalledExactlyOnceWith('in-play');
  expect(onOutcome).not.toHaveBeenCalled();
 });
 it('opts in to corrections after each outcome without enabling unrecorded people or changing other owners',()=>{
  const onChange=vi.fn(),props={name:'Sally',value:'saved',states,present:'in-play',art:{src:'/portrait.webp'},showStatusEditor:false,outcomes:['saved','killed','left'],onChange};
  const {rerender}=render(<CharacterControl {...props}/>);
  expect(screen.getByRole('button',{name:'Mark Sally killed'})).toBeDisabled();
  for(const value of ['saved','killed','left']){
   rerender(<CharacterControl {...props} value={value} allowOutcomeCorrections/>);
   for(const outcome of ['saved','killed','left'])expect(screen.getByRole('button',{name:`Mark Sally ${outcome}`})).toBeEnabled();
   fireEvent.click(screen.getByRole('button',{name:'Mark Sally killed'}));
  }
  expect(onChange.mock.calls).toEqual([['killed'],['killed'],['killed']]);
  rerender(<CharacterControl {...props} value={undefined} allowOutcomeCorrections/>);
  expect(screen.getByRole('button',{name:'Mark Sally saved'})).toBeDisabled();
 });
});
