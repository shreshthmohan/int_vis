import random
import numpy as np
import pandas as pd
import pdb
from scipy import stats
import itertools

num_customers_base = 4000000
scaling_factor = 1 / 1000
num_customers = num_customers_base * scaling_factor

lobs = [
    {'id': 1, 'name': 'Consumer Auto', 'call_share': (20, 30)},
    {'id': 2, 'name': 'Dealer', 'call_share': (20, 30)},
    {'id': 3, 'name': 'Refinance', 'call_share': (10, 20)},
    {'id': 4, 'name': 'Servicing', 'call_share': (40, 55)},
    {'id': 5, 'name': 'United Income', 'call_share': (5, 10)},
]

experiences = [
    {'id': 1, 'name': 'Decision The Deal', 'short_name': 'DTD',
     'lob': 'Servicing', 'call_share': 5},
    # { 'id': 2, 'name': 'Desk & Finalize My Deals', 'short_name': 'DFD', 'lob': 'Servicing', 'call_share': 5},
    {'id': 3, 'name': 'Fund My Deal', 'short_name': 'FMD',
        'lob': 'Servicing', 'call_share': 5},
    {'id': 4, 'name': 'Inside Sales', 'short_name': 'IS',
        'lob': 'Servicing', 'call_share': 5},
    # { 'id': 5, 'name': 'Keep Our Relationship Sustainable (Dealer Risk)', 'short_name': 'DR', 'lob': 'Servicing', 'call_share': 5},
    {'id': 6, 'name': 'Manage My Leads', 'short_name': 'MML',
        'lob': 'Servicing', 'call_share': 5},
    {'id': 7, 'name': 'Outside Sales', 'short_name': 'OS',
        'lob': 'Servicing', 'call_share': 5},
    {'id': 8, 'name': 'Close My Account', 'short_name': 'CMA',
        'lob': 'Servicing', 'call_share': 5},
    {'id': 9, 'name': 'Help Me Catch Up', 'short_name': 'HMC',
        'lob': 'Servicing', 'call_share': 5},
    {'id': 10, 'name': 'Keep Me In My Car', 'short_name': 'KMIC',
        'lob': 'Servicing', 'call_share': 5},
    # { 'id': 11, 'name': 'Keep My Payments Simple', 'short_name': 'KPS', 'lob': 'Servicing', 'call_share': 10},
    {'id': 12, 'name': 'Move On', 'short_name': 'MO',
        'lob': 'Servicing', 'call_share': 10},
    {'id': 13, 'name': 'Navigate My Account', 'short_name': 'NMA',
        'lob': 'Servicing', 'call_share': 10},
    {'id': 14, 'name': 'Set Up My Loan', 'short_name': 'SML',
        'lob': 'Servicing', 'call_share': 10},
    {'id': 15, 'name': 'Vehicle Resolution', 'short_name': 'VR',
        'lob': 'Servicing', 'call_share': 10},
]

queues = [
    {'name': 'Collections', 'id': 'COL'},
    {'name': 'Recoveries', 'id': 'REC'},
    {'name': 'Enquiry', 'id': 'ENQ'},
    {'name': 'Escalations', 'id': 'ESC'},
    {'name': 'Digital', 'id': 'DIG'},
    {'name': 'Cross-sell', 'id': 'CRS'},
    {'name': 'Paperwork', 'id': 'PW'},
]

periods = [
    {"id": 1, "start": '2019-01-01', "end": '2020-02-28',
     "calls": (30, 40), "lob_frustration": [0, 3, 10, 5, 2, 1, 0, 0, 0, 0, 0], "frustration": [5, 10, 2, 1]},
    {"id": 2, "start": '2020-03-01', "end": '2020-12-31',
        "calls": (75, 85), "lob_frustration": [0, 0, 0, 0, 0, 1, 3, 5, 10, 7, 0], "frustration": [1, 3, 6, 6]},
    # {"id": 3, "start": '2021-01-01', "end": '2021-05-31', "calls": (35, 45), "lob_frustration": [0, 0, 2, 5, 10, 3, 2, 1, 0, 0, 0],"frustration": [2, 5, 10, 3]},
    {"id": 3, "start": '2021-01-01', "end": '2021-04-30',
        "calls": (35, 45), "lob_frustration": [0, 3, 10, 5, 2, 1, 0, 0, 0, 0, 0], "frustration": [2, 5, 10, 3]},
]

frustration_dist = [
    # {'id': 1, 'cat': 'Very Low', 'dist': [0, 1, 2, 3, 2, 1, 1, 0, 0, 0, 0]},
    {'id': 2, 'dist': [0, 3, 10, 5, 2, 1, 0, 0, 0, 0, 0], 'cat': 'Low'},
    {'id': 3, 'dist': [0, 0, 2, 5, 10, 3, 2, 1, 0, 0, 0], 'cat': 'Medium'},
    {'id': 4, 'dist': [0, 0, 0, 0, 2, 5, 10, 4, 2, 0, 0], 'cat': 'High'},
    {'id': 5, 'dist': [0, 0, 0, 0, 0, 1, 3, 5, 10, 7, 0], 'cat': 'Very High'},
]

df_lobs = pd.DataFrame(data=lobs)
df_experiences = pd.DataFrame(data=experiences)
df_queues = pd.DataFrame(data=queues)
df_frustration = pd.DataFrame(data=frustration_dist)
df_states = pd.read_csv('src/data/new/states.csv', ',')
df_unemp = pd.read_csv('src/data/new/unemployment.csv', ',')


def generate_queues():

    df = pd.DataFrame(columns=['experience', 'queue', 'num', 'name', 'id'])
    count = 0
    for i_e, row_e in df_experiences.iterrows():
        # Experience config
        num_queues = random.randint(3, 6)
        for i_q, row_q in df_queues.iterrows():
            # Queue config
            # call_share = random.randint(1, 50)
            # frustration_dist = [] #Low, Med, High x Randomness
            for num in range(1, num_queues):
                count = count + 1
                df = df.append({
                    'experience': row_e['name'],
                    'queue': row_q['name'],
                    'num': str(num),
                    'name': row_e['short_name'] + '-' + row_q['id'] + '-' + str(num),
                    'id': count
                }, ignore_index=True)

    return df


def gen_calls():

    cols = ['call_id', 'date', 'lob', 'experience',
            'queue', 'frustration', 'state', 'state_frust']
    df = pd.DataFrame(columns=cols)

    df_q_orig = generate_queues()

    for period in periods:
        df_q = df_q_orig
        months_ = pd.date_range(
            start=period['start'], end=period['end'], freq='MS').strftime('%Y-%m')

        exp_call_share = np.random.uniform(
            5, 100, len(df_experiences)).round(0)
        queue_call_share = np.random.uniform(50, 1000, len(df_q)).round(0)

        # Add frustration for other lobs
        lob_frust_share = np.array(
            period['lob_frustration'])/np.array(period['lob_frustration']).sum()
        lob_frust_dist = stats.rv_discrete(
            name='lob_frust_dist', values=(np.arange(0, 11), lob_frust_share))

        df_q['call_share'] = queue_call_share
        frust_share = np.array(
            period['frustration'])/np.array(period['frustration']).sum()
        frust_dist = stats.rv_discrete(
            name='frust_dist', values=(df_frustration['id'], frust_share))
        df_q['cat'] = list(map(
            lambda x: df_frustration.loc[df_frustration['id']
                                         == x, 'cat'].values[0],
            frust_dist.rvs(size=len(df_q))
        ))
        df_q = df_q.merge(
            df_frustration[['cat', 'dist']], how='left', left_on='cat', right_on='cat')

        for month_ in months_:

            print(month_)
            df_ = pd.DataFrame(columns=cols)

            call_ratio = random.randrange(
                period['calls'][0], period['calls'][1])/100
            n_calls = num_customers * call_ratio

            df_['call_id'] = np.arange(1, n_calls+1)
            df_ = df_.assign(date=month_)

            # States
            df_unemp_s = df_unemp[(df_unemp['month_'] == month_)
             & (~pd.isnull(df_unemp['code']))]
            df_unemp_s['call_share'] = df_unemp_s['Population'] / \
                df_unemp_s['Population'].sum()
            state_dist = stats.rv_discrete(name='state_dist', values=(
                df_unemp_s['fips'], df_unemp_s['call_share']))
            df_['state'] = list(map(
                lambda x: df_unemp_s.loc[df_unemp_s['fips']
                                         == x, 'code'].values[0],
                state_dist.rvs(size=int(n_calls))
            ))

            for i_s, row_s in df_unemp_s.iterrows():
                unemployment_rate = df_unemp_s.loc[df_unemp_s['code'] == row_s['code'],'Unemployment Rate'].values[0]
                if 0 < unemployment_rate <= 2.5:
                    dist_cat = 'Low'
                elif 2.5 < unemployment_rate <= 5:
                    dist_cat = 'Medium'
                elif 5 < unemployment_rate <= 7.5:
                    dist_cat = 'High'
                elif 7.5 >= unemployment_rate:
                    dist_cat = 'Very High'
                
                dist_ = df_frustration.loc[df_frustration['cat'] == dist_cat,'dist'].values[0]
                _dist_ = np.array(dist_)/np.array(dist_).sum()
                # pdb.set_trace()

                frustration_dist_states = stats.rv_discrete(
                    name='frustration_dist_states', values=(np.arange(0, 11), _dist_))
                
                _filter_ = (df_['state'] == row_s['code'])
                df_.loc[_filter_, 'state_frust'] = frustration_dist_states.rvs(
                    size=_filter_.sum())

                # pdb.set_trace()

            # Lobs
            lob_call_share = df_lobs.apply(lambda x: random.randint(
                x['call_share'][0], x['call_share'][1]), axis=1)
            df_lobs['lob_call_share'] = lob_call_share / lob_call_share.sum()
            lobs_dist = stats.rv_discrete(name='lobs_dist', values=(
                df_lobs['id'], df_lobs['lob_call_share']))
            df_['lob'] = list(map(
                lambda x: df_lobs.loc[df_lobs['id'] == x, 'name'].values[0],
                lobs_dist.rvs(size=int(n_calls))
            ))

            # Experiences
            df_experiences['exp_call_share'] = exp_call_share / \
                exp_call_share.sum()
            exp_dist = stats.rv_discrete(name='exp_dist', values=(
                df_experiences['id'], df_experiences['exp_call_share']))
            filter_ = df_['lob'] == 'Servicing'
            df_.loc[filter_, 'experience'] = list(map(
                lambda x: df_experiences.loc[df_experiences['id']
                                             == x, 'name'].values[0],
                exp_dist.rvs(size=filter_.sum())
            ))

            df_.loc[~filter_, 'experience'] = 'NA'
            df_.loc[~filter_, 'queue'] = 'NA'
            df_.loc[~filter_, 'frustration'] = lob_frust_dist.rvs(
                size=(~filter_).sum())

            for i_e, row_e in df_experiences.iterrows():
                filter_ = (df_q['experience'] == row_e['name'])
                df_t = df_q[filter_]
                queue_share = df_t['call_share'] / df_t['call_share'].sum()
                queue_dist = stats.rv_discrete(
                    name='queue_dist', values=(df_t['id'], queue_share))
                _filter_ = (df_['experience'] == row_e['name']) & (
                    df_['lob'] == 'Servicing')
                df_.loc[_filter_, 'queue'] = list(map(
                    lambda x: df_q.loc[df_q['id'] == x, 'name'].values[0],
                    queue_dist.rvs(size=_filter_.sum())
                ))

                for i_q, row_q in df_t.iterrows():
                    try:
                        frust_dist = np.array(
                            row_q['dist'])/np.array(row_q['dist']).sum()
                        frustration_dist = stats.rv_discrete(
                            name='frustration_dist', values=(np.arange(0, 11), frust_dist))
                        _filter_ = (df_['experience'] == row_e['name']) & (
                            df_['lob'] == 'Servicing') & (df_['queue'] == row_q['name'])
                        df_.loc[_filter_, 'frustration'] = frustration_dist.rvs(
                            size=_filter_.sum())
                    except:
                        pdb.set_trace()

            df = df.append(df_, ignore_index=True)

    return df


def process_data_for_viz():

    df = pd.read_csv('src/data/new/raw_data.csv', ',')

    condlist = [df['date'] <= '2020-02',
                (df['date'] > '2020-02') & (df['date'] <= '2020-12'), df['date'] > '2020-12']
    choicelist = ['Pre', 'Pan', 'Post']
    df['period'] = np.select(condlist, choicelist)

    # Call volumne
    call_volumes = pd.pivot_table(df, values='call_id', index=[
                                  'date', 'period'], columns=['lob'], aggfunc='count')
    # call_volumes.to_csv('calls.csv', ',')

    # Frustration
    frustration = pd.pivot_table(df, values='call_id', index=[
                                 'frustration'], columns=['lob', 'period'], aggfunc='count')
    frustration.columns = [x[0] + ' ' + x[1]
                           for x in frustration.columns.ravel()]
    frustration.fillna(0, inplace=True)
    frustration = frustration.apply(lambda x: x/x.sum(), axis=1)
    # frustration.to_csv('src/data/new/frustration.csv', ',')

    # Queues
    queues = pd.pivot_table(df, values=['call_id', 'frustration'], index=[
                            'period', 'experience', 'queue'], columns=[], aggfunc=['count', 'mean'])
    queues.columns = [x[0] + ' ' + x[1] for x in queues.columns.ravel()]
    queues = queues[['count call_id', 'mean frustration']]
    queues.rename(columns={"count call_id": "calls",
                           "mean frustration": "frustration"}, inplace=True)
    # queues.to_csv('src/data/new/queues.csv', ',')

    # Dominos
    dominos = pd.pivot_table(df, values=['call_id', 'frustration'], index=[
                             'date', 'period', 'experience', 'queue'], columns=[], aggfunc=['count', 'mean'])
    dominos.columns = [x[0] + ' ' + x[1] for x in dominos.columns.ravel()]
    domoinos = dominos[['count call_id', 'mean frustration']]
    domoinos.rename(columns={"count call_id": "calls",
                             "mean frustration": "frustration"}, inplace=True)
    # dominos.to_csv('src/data/new/dominos.csv', ',')

    # Motion
    motion = pd.pivot_table(df, values=['call_id', 'state_frust'], index=[
                             'date', 'period', 'state'], columns=[], aggfunc=['count', 'mean'])
    motion.columns = [x[0] + ' ' + x[1] for x in motion.columns.ravel()]
    motion = motion[['count call_id', 'mean state_frust']]
    motion.rename(columns={"count call_id": "calls",
                             "mean state_frust": "frustration"}, inplace=True)
    motion = motion.reset_index()
    state_codes = pd.read_csv('fips_state_code.csv', ',')
    # state_codes = pd.read_csv('src/data/new/fips_state_code.csv', ',')
    motion = motion.merge(state_codes, how='left', left_on='state', right_on='code')
    # pdb.set_trace()
    motion = motion.merge(df_unemp[['Unemployment Rate', 'state', 'month_']], how='left', left_on=['date', 'state_y'], right_on=['month_', 'state'])
    motion.to_csv('motion.csv', ',', index=False)

    return ''


def process_unemployment_data():

    df_unemp = pd.read_csv('ststdnsadata_p.csv', ',')
    df_codes = pd.read_csv('fips_state_code.csv', ',')
    df_ = df_unemp[df_unemp['Year'].isin(['2019', '2020', '2021'])]
    df_ = df_.merge(df_codes, how='left',
                    left_on='State and area', right_on='state')
    df_['day'] = 1
    df_['month_'] = pd.to_datetime(
        df_[['Year', 'Month', 'day']]).dt.strftime('%Y-%m')
    df_.to_csv('unemployment.csv', ',', index=False)

    df_states = df_[(df_['Year'] == 2021) & (
        df_unemp['Month'] == 4)].groupby(['code', 'fips'])['Population'].sum()
    df_states = df_states.reset_index()
    df_states.to_csv('states.csv', ',', index=False)

    return ''


if __name__ == "__main__":
    # Config
    pd.set_option('display.max_rows', 4000)
    print("Main")
    # df_unemp = pd.read_csv('ststdnsadata_p.csv', ',')

    # Process unemployment data
    # process_unemployment_data()

    # Generate Calls Data
    # df = gen_calls()
    # df.to_csv('src/data/new/raw_data.csv', ',', index=False)

    # pdb.set_trace()

    # Process Data for viz
    process_data_for_viz()
    pdb.set_trace()

    # df.groupby(['lob', 'experience']).count()
    # table = pd.pivot_table(df, values='call_id', index=['date'], columns=['lob'], aggfunc='count')
    # df['frustration'] = df['frustration'].astype('float64')
    # pd.pivot_table(df, values='frustration', index=['date'], columns=['lob'], aggfunc=np.mean)
